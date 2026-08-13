import React, { useEffect } from 'react';
import { MessageSquare } from 'lucide-react';

export const DisqusForum: React.FC = () => {
  useEffect(() => {
    // Inject Disqus embed script
    const existingEmbedScript = document.querySelector('script[src*="smu-agentic-ai.disqus.com/embed.js"]');
    if (!existingEmbedScript) {
      const s = document.createElement('script');
      s.src = 'https://smu-agentic-ai.disqus.com/embed.js';
      s.setAttribute('data-timestamp', String(+new Date()));
      s.async = true;
      (document.head || document.body).appendChild(s);
    } else if ((window as any).DISQUS) {
      (window as any).DISQUS.reset({ reload: true });
    }

    // Inject Disqus comment count script
    const existingCountScript = document.getElementById('dsq-count-scr');
    if (!existingCountScript) {
      const countScript = document.createElement('script');
      countScript.id = 'dsq-count-scr';
      countScript.src = '//smu-agentic-ai.disqus.com/count.js';
      countScript.async = true;
      (document.head || document.body).appendChild(countScript);
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

      <div id="disqus_thread" className="min-h-[200px]" />
      <noscript>
        Please enable JavaScript to view the{' '}
        <a href="https://disqus.com/?ref_noscript" rel="noreferrer" className="text-[#2962ff] underline">
          comments powered by Disqus.
        </a>
      </noscript>
    </section>
  );
};
