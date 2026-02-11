const AI_CONFIG = {
  chatgpt: {
    baseUrl: 'https://chat.openai.com/',
    queryParam: 'q'
  },
  grok: {
    baseUrl: 'https://x.com/i/grok',
    queryParam: 'text'
  },
  perplexity: {
    baseUrl: 'https://www.perplexity.ai/search/new',
    queryParam: 'q'
  },
  claude: {
    baseUrl: 'https://claude.ai/new',
    queryParam: 'q'
  },
  google: {
    baseUrl: 'https://www.google.com/search',
    queryParam: 'q',
    additionalParams: { udm: '50' }
  }
};

function initAILinks() {
  const containers = document.querySelectorAll('[data-ai-query]');
  const currentUrl = window.location.href;
  
  containers.forEach(container => {
    // Get query from attribute
    let query = container.getAttribute('data-ai-query');
    
    if (!query || query.trim() === '') {
      // No custom query -> "tell me about [URL]"
      query = `tell me about ${currentUrl}`;
    } else {
      // Has custom query -> append the URL
      query = `${query} ${currentUrl}`;
    }
    
    // Find and update each AI link
    Object.keys(AI_CONFIG).forEach(platform => {
      const link = container.querySelector(`[data-ai-${platform}]`);
      if (!link) return;
      
      const config = AI_CONFIG[platform];
      const params = new URLSearchParams();
      params.set(config.queryParam, query);
      
      if (config.additionalParams) {
        Object.entries(config.additionalParams).forEach(([key, value]) => {
          params.set(key, value);
        });
      }
      
      link.href = `${config.baseUrl}?${params.toString()}`;
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAILinks);
} else {
  initAILinks();
}

// Expose for dynamic content
window.reinitAILinks = initAILinks;
