let currentQuestionIndex = 0;

// Chọn khoảng id mà bạn muốn hiển thị
const startId = 6; // Bắt đầu từ id = 7
const endId = 16; // Kết thúc ở id = 16

fetch('https://raw.githubusercontent.com/minhnguyen412/chinese60s/refs/heads/main/data.json')
    .then(response => response.json())
    .then(data => {
        // Lọc câu hỏi trong khoảng id mong muốn
        const filteredQuestions = data.questions.filter(question =>
            question.id >= startId && question.id <= endId
        );

        // Kiểm tra nếu không có câu hỏi nào trong khoảng id
        if (filteredQuestions.length === 0) {
            console.error('No questions found in the specified ID range');
            return;
        }

        const sentenceDiv = document.getElementById('sentence');
        const optionsDiv = document.getElementById('options');
        const resultDiv = document.querySelector('.result');
        const buttonsDiv = document.getElementById('buttons');

        const initialAudio = new Audio();
        const clickAudio = new Audio('click.mp3');
        const correctAudio = new Audio('correct.mp3');
        const incorrectAudio = new Audio('incorrect.mp3');
        const completionAudio = new Audio('victory.mp3');

        // Hiển thị câu hỏi
        function displayQuestion(questionIndex) {
            const question = filteredQuestions[questionIndex];
            const blanks = question.blanks;
            const words = question.words;

            // Kiểm tra tồn tại của trường `audio` trong JSON
            if (question.audio) {
                initialAudio.src = question.audio; // Đảm bảo `audio` tồn tại trong JSON
                initialAudio.play().catch(error => console.error('Audio playback error:', error));
            }

            // Hiển thị câu với các chỗ trống
            let sentenceHTML = '';
            if (Array.isArray(question.sentence)) {
                sentenceHTML = question.sentence.map(item => renderMixedContent(item)).join('');
            } else {
                sentenceHTML = renderMixedContent(question.sentence);
            }

            blanks.forEach(() => {
                sentenceHTML = sentenceHTML.replace('___', `<span class="blank"></span>`);
            });

            sentenceDiv.innerHTML = sentenceHTML;

            // Hiển thị các lựa chọn từ vựng
            optionsDiv.innerHTML = '';
            words.forEach(word => {
                const button = document.createElement('button');
                button.classList.add('word');
                button.innerHTML = renderMixedContent(word); // Hiển thị nội dung trộn lẫn trong các nút
                button.addEventListener('click', () => handleWordClick(button, blanks));
                optionsDiv.appendChild(button);
            });

            resultDiv.textContent = '';
            resultDiv.classList.remove('correct', 'incorrect');
            buttonsDiv.innerHTML = '';

            // Thêm nút phát lại audio
            const replayButton = document.createElement('button');
            replayButton.textContent = '☊';
            replayButton.classList.add('replay');
            replayButton.addEventListener('click', () => {
                initialAudio.currentTime = 0; // Đặt lại thời gian phát audio
                initialAudio.play();
            });
            buttonsDiv.appendChild(replayButton);
        }

        // Hàm kiểm tra nếu một chuỗi là đường dẫn hình ảnh
        function isImagePath(path) {
            return /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(path);
        }

        // Hàm hiển thị nội dung trộn lẫn (văn bản hoặc hình ảnh)
        function renderMixedContent(content) {
            if (isImagePath(content)) {
                return `
                    <div class="image-wrapper">
                        <img src="${content}" alt="Image" class="content-image">
                    </div>`;
            } else {
                return content; // Hiển thị như văn bản nếu không phải hình ảnh
            }
        }

        function handleWordClick(button, blanks) {
            clickAudio.play();
            const blanksArray = document.querySelectorAll('.blank');
            const currentBlankIndex = Array.from(blanksArray).findIndex(blank => blank.textContent === "");

            if (currentBlankIndex >= 0) {
                const blank = blanksArray[currentBlankIndex];
                blank.innerHTML = button.innerHTML; // Sử dụng innerHTML để bao gồm cả hình ảnh
                blank.classList.add('filled');

                const currentQuestion = filteredQuestions[currentQuestionIndex];
                const correctAnswer = currentQuestion.blanks[currentBlankIndex].answer;

                if (button.textContent === correctAnswer) {
                    button.disabled = true;
                    button.style.backgroundColor = '#28a745';
                    button.style.color = 'white';
                } else {
                    button.style.backgroundColor = '#dc3545';
                    button.style.color = 'white';
                }

                if (Array.from(blanksArray).every(b => b.innerHTML !== "")) {
                    checkAnswers();
                }
            }
        }

        function checkAnswers() {
            const blanksArray = document.querySelectorAll('.blank');
            const currentQuestion = filteredQuestions[currentQuestionIndex];
            let correct = true;

            blanksArray.forEach((blank, index) => {
                if (blank.innerHTML !== renderMixedContent(currentQuestion.blanks[index].answer)) {
                    correct = false;
                }
            });

            if (correct) {
                resultDiv.textContent = 'Correct! Great job!';
                resultDiv.classList.add('correct');
                correctAudio.play();
                showNextButton();
            } else {
                resultDiv.textContent = 'Incorrect. Try again!';
                resultDiv.classList.add('incorrect');
                incorrectAudio.play();
                showRetryButton();
            }
        }

        function showNextButton() {
            const nextButton = document.createElement('button');
            nextButton.textContent = 'Next';
            nextButton.classList.add('next');
            nextButton.addEventListener('click', () => {
                currentQuestionIndex++;
                if (currentQuestionIndex < filteredQuestions.length) {
                    displayQuestion(currentQuestionIndex);
                } else {
                    resultDiv.textContent = 'You have completed all the questions!';
                    resultDiv.classList.add('correct');
                    completionAudio.play();
                    showReplayButton();
                }
            });
            buttonsDiv.appendChild(nextButton);
        }

        function showRetryButton() {
            const retryButton = document.createElement('button');
            retryButton.textContent = 'Retry';
            retryButton.classList.add('retry');
            retryButton.addEventListener('click', () => {
                displayQuestion(currentQuestionIndex);
            });
            buttonsDiv.appendChild(retryButton);
        }

        function showReplayButton() {
            const replayButton = document.createElement('button');
            replayButton.textContent = 'Replay';
            replayButton.classList.add('replay');
            replayButton.addEventListener('click', () => {
                currentQuestionIndex = 0; // Đặt lại chỉ số câu hỏi về 0
                displayQuestion(currentQuestionIndex); // Hiển thị câu hỏi đầu tiên
            });
            buttonsDiv.innerHTML = ''; // Xóa các nút hiện tại
            buttonsDiv.appendChild(replayButton); // Thêm nút Replay
        }

        // Hiển thị câu hỏi đầu tiên
        displayQuestion(currentQuestionIndex);
    })
    .catch(error => {
        console.error('Error loading the JSON file:', error);
    });
