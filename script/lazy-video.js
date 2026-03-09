function lazyLoadVideo() {
    const videos = document.querySelectorAll('video[data-video-src]');
    
    videos.forEach(video => {
        const videoSrc = video.getAttribute('data-video-src');
        
        if (videoSrc) {
            video.src = videoSrc;
            video.removeAttribute('data-video-src');
            video.load();
            video.play().catch(e => console.log('Autoplay blocked'));
        }
    });
}

window.addEventListener('load', function() {
    setTimeout(lazyLoadVideo, 100);
});
