	document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        const formBlock = document.querySelector('.form_component');
        if (formBlock) {
            const blockHeight = formBlock.offsetHeight;
            formBlock.style.height = `${blockHeight}px`;
        }
    }, 1000);
});
