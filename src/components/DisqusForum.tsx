import React, { useEffect, useState } from 'react';
import { MessageSquare, AlertCircle } from 'lucide-react';

export const DisqusForum: React.FC = () => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Configure Disqus variables to avoid cross-origin location access issues in iFrames
    (window as any).disqus_config = function () {
      this.page.url = window.location.href.split('#')[0];
      this.page.identifier = 'tradingview-clone-discussion-forum';
    };

    let embedScript: HTMLScriptElement | null = null;
    let countScript: HTMLScriptElement | null = null;

    try {
      // Inject Disqus embed script
      const existingEmbedScript = document.querySelector('script[src*="smu-agentic-ai.disqus.com/embed.js"]');
      if (!existingEmbedScript) {
        embedScript = document.createElement('script');
        embedScript.src = 'https://smu-agentic-ai.disqus.com/embed.js';
        embedScript.setAttribute('data-timestamp', String(+new Date()));
        embedScript.async = true;
        embedScript.onerror = () => {
          console.warn('Disqus embed failed to load (blocked by browser or network).');
          setHasError(true);
        };
        (document.head || document.body).appendChild(embedScript);
      } else if ((window as any).DISQUS) {
        (window as any).DISQUS.reset({
          reload: true,
          config: (window as any).disqus_config,
        });
      }

      // Inject Disqus comment count script
      const existingCountScript = document.getElementById('dsq-count-scr');
      if (!existingCountScript) {
        countScript = document.createElement('script');
        countScript.id = 'dsq-count-scr';
        countScript.src = 'https://smu-agentic-ai.disqus.com/count.js';
        countScript.async = true;
        countScript.onerror = () => {
          console.warn('Disqus count script failed to load.');
        };
        (document.head || document.body).appendChild(countScript);
      }
    } catch (err) {
      console.warn('Error initializing Disqus:', err);
      setHasError(true);
    }
  }, []);

  return (
    <section className="mt-12 bg-[#1E222D] rounded-xl border border-[#2A2E39] p-6 shadow-sm">
      <div className="flex items-center gap-2 pb-4 mb-6 border-b border-[#2A2E39]">
        <MessageSquare className="w-5 h-5 text-[#2962ff]" />
        <h2 className="text-xl font-bold font-['Hanken_Grotesk'] text-[#dfe2f2]">
          Community Discussion Forum
        </h2>
      </div>

      {hasError ? (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-[#171b26] border border-[#2A2E39] text-xs text-[#8d90a2]">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
          <span>
            Unable to load the Disqus discussion thread. If you are using an adblocker or strict tracking protection, please allow Disqus or open the application in a new tab.
          </span>
        </div>
      ) : (
        <div id="disqus_thread" className="min-h-[200px]" />
      )}

      <noscript>
        Please enable JavaScript to view the{' '}
        <a href="https://disqus.com/?ref_noscript" rel="noreferrer" className="text-[#2962ff] underline">
          comments powered by Disqus.
        </a>
      </noscript>
    </section>
  );
};
