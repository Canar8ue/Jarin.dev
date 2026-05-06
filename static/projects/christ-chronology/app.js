 
document.addEventListener('DOMContentLoaded', () => {
    // 1. DOM Elements
    const timelineContainer = document.getElementById('timeline-container');
    const template = document.getElementById('timeline-item-template');
    
    // Modal Elements
    const modalOverlay = document.getElementById('event-modal');
    const closeBtn = document.querySelector('.close-btn');
    const modalImage = document.getElementById('modal-image');
    const modalDate = document.getElementById('modal-date');
    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.getElementById('modal-description');
    const modalScripture = document.getElementById('modal-scripture');

    // 2. Render Timeline Function
    function renderTimeline() {
        // Clear container just in case
        timelineContainer.innerHTML = '';

        timelineData.forEach(event => {
            // Clone the template content
            const clone = template.content.cloneNode(true);
            
            // Populate the clone with data
            // Note: querySelector searches *within* our cloned fragment
            clone.querySelector('.date-badge').textContent = event.date;
            clone.querySelector('.event-title').textContent = event.title;
            clone.querySelector('.event-snippet').textContent = event.snippet;
            // Select card container
            const card = clone.querySelector('.timeline-content');
            // Add Click Event to "Read More" button
            card.addEventListener('click', () => openModal(event));

            // Append to the DOM
            timelineContainer.appendChild(clone);
        });

        // Initialize Scroll Animations after elements are in DOM
        initScrollAnimations();
    }

    // 3. Modal Logic
    function openModal(event) {
        modalImage.src = event.image;
        modalImage.alt = event.title;
        modalDate.textContent = event.date;
        modalTitle.textContent = event.title;
        modalDesc.textContent = event.details;
        modalScripture.textContent = event.scripture;

        modalOverlay.classList.add('open');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    function closeModal() {
        modalOverlay.classList.remove('open');
        document.body.style.overflow = ''; // Restore scrolling
    }

    // Close on button click
    closeBtn.addEventListener('click', closeModal);

    // Close on click outside the card
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalOverlay.classList.contains('open')) {
            closeModal();
        }
    });

    // 4. Scroll Animation (Intersection Observer)
    function initScrollAnimations() {
        const observerOptions = {
            threshold: 0.2, // Trigger when 20% of the item is visible
            rootMargin: "0px 0px -50px 0px" // Offset slightly so it triggers before hitting bottom
        };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target); // Only animate once
                }
            });
        }, observerOptions);

        // Target all timeline items
        const items = document.querySelectorAll('.timeline-item');
        items.forEach(item => observer.observe(item));
    }

    // Run the app
    renderTimeline();
    
});