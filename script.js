// Fetch data from GitHub JSON file and display
fetch('https://raw.githubusercontent.com/minhnguyen412/chinese60s/main/imagesData.json')
    .then(response => response.json())
    .then(data => {
        const imageGrid = document.getElementById('imageGrid');
        data.reverse();

        data.forEach(item => {
            const card = document.createElement('div');
            card.classList.add('card');
            card.setAttribute('data-id', item.id);

            // Card front with image
            const cardFront = document.createElement('div');
            cardFront.classList.add('card-front');
            const img = document.createElement('img');
            img.src = item.imageSrc;
            img.alt = `Từ mới ${item.character}`;
            cardFront.appendChild(img);

            // Card back with details
            const cardBack = document.createElement('div');
            cardBack.classList.add('card-back');
            const characterTitle = document.createElement('h2');
            characterTitle.innerHTML = item.character.split('').map(c => 
                `<span class="character">${c}</span>`).join('');

            const meaningText = document.createElement('p');
            meaningText.textContent = `${item.meaning}`;

            // Add Pinyin to the card back
            const pinyinText = document.createElement('p');
            pinyinText.textContent = `${item.pinyin}`;

            const strokeOrderDiv = document.createElement('div');
            strokeOrderDiv.id = `stroke-order-${item.id}`;

            cardBack.appendChild(pinyinText); 
            cardBack.appendChild(characterTitle);
            cardBack.appendChild(meaningText); 
            cardBack.appendChild(strokeOrderDiv);

            card.appendChild(cardFront);
            card.appendChild(cardBack);
            imageGrid.appendChild(card);

            // Create HanziWriter instance for each card
            let writer = null;

            // Add click event for each character element
            const characterElements = cardBack.querySelectorAll('.character');
            characterElements.forEach((char, index) => {
                char.addEventListener('click', (event) => {
                    event.stopPropagation();

                    // Reset character and stroke order states
                    resetClickedCharacters(cardBack);
                    resetStrokeOrder(item.id, `stroke-order-${item.id}`);

                    // Highlight clicked character
                    char.classList.add('clicked');

                    // Initialize stroke order animation
                    writer = HanziWriter.create(`stroke-order-${item.id}`, item.character[index], {
                        width: 100,
                        height: 100,
                        padding: 5,
                        showOutline: true
                    });

                    writer.animateCharacter();
                });
            });

            // Add flip functionality for the card when clicking outside characters
            card.addEventListener('click', (event) => {
                if (!event.target.classList.contains('character')) {
                    card.classList.toggle('flipped');
                    resetClickedCharacters(cardBack);
                    resetStrokeOrder(item.id, `stroke-order-${item.id}`);
                }
            });
        });
    })
    .catch(error => console.error('Error fetching JSON:', error));

// Reset stroke order display
function resetStrokeOrder(cardId, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
}

// Reset clicked character highlight
function resetClickedCharacters(cardBack) {
    const allCharacters = cardBack.querySelectorAll('.character');
    allCharacters.forEach(char => {
        char.classList.remove('clicked');
    });
}
