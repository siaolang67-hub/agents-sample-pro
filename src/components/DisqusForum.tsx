import React, { useEffect, useState, useRef } from 'react';
import {
  MessageSquare,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Send,
  ThumbsUp,
  ShieldAlert,
  User,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

interface LocalComment {
  id: string;
  author: string;
  avatar: string;
  role: string;
  timestamp: string;
  content: string;
  likes: number;
  liked: boolean;
  tag?: string;
}

const INITIAL_LOCAL_COMMENTS: LocalComment[] = [
  {
    id: 'c-1',
    author: 'QuantTrader_88',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
    role: 'Pro Analyst',
    timestamp: '15 mins ago',
    content: 'NVIDIA (NVDA) RSI is reaching 78.5 on the 4-hour chart. Keeping an eye on the 125 resistance level before considering long positions.',
    likes: 12,
    liked: false,
    tag: 'NVDA',
  },
  {
    id: 'c-2',
    author: 'CryptoWhale_Alpha',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
    role: 'Top Contributor',
    timestamp: '42 mins ago',
    content: 'Bitcoin holding above $64,000 zone solidly. Strong order book bid depth sitting around $63,200.',
    likes: 24,
    liked: true,
    tag: 'BTCUSD',
  },
  {
    id: 'c-3',
    author: 'MacroVision',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80',
    role: 'Market Strategist',
    timestamp: '2 hours ago',
    content: 'Federal Reserve rate cut expectations continue to drive upside momentum across S&P 500 and Nasdaq tech sector leaders.',
    likes: 8,
    liked: false,
    tag: 'SPX',
  },
];

export const DisqusForum: React.FC = () => {
  const [isAdBlockerDetected, setIsAdBlockerDetected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState<'disqus' | 'community'>('disqus');

  // Local comments state for fallback/hybrid discussion board
  const [localComments, setLocalComments] = useState<LocalComment[]>(() => {
    try {
      const saved = localStorage.getItem('tv_community_comments');
      return saved ? JSON.parse(saved) : INITIAL_LOCAL_COMMENTS;
    } catch {
      return INITIAL_LOCAL_COMMENTS;
    }
  });

  const [newCommentText, setNewCommentText] = useState('');
  const [authorName, setAuthorName] = useState('Trader_Guest');
  const disqusContainerRef = useRef<HTMLDivElement>(null);

  const saveLocalComments = (comments: LocalComment[]) => {
    setLocalComments(comments);
    try {
      localStorage.setItem('tv_community_comments', JSON.stringify(comments));
    } catch (e) {
      console.error('Failed to save community comments', e);
    }
  };

  const loadDisqusScript = () => {
    setIsLoading(true);
    setIsAdBlockerDetected(false);

    // Setup Disqus global configuration object
    (window as any).disqus_config = function () {
      this.page.url = window.location.href.split('#')[0];
      this.page.identifier = 'tradingview-clone-discussion-forum';
    };

    // Remove existing scripts if retrying
    const existingScript = document.querySelector('script[src*="disqus.com/embed.js"]');
    if (existingScript && existingScript.parentNode) {
      existingScript.parentNode.removeChild(existingScript);
    }

    const script = document.createElement('script');
    script.src = 'https://smu-agentic-ai.disqus.com/embed.js';
    script.setAttribute('data-timestamp', String(+new Date()));
    script.async = true;

    script.onload = () => {
      setIsLoading(false);
      setIsAdBlockerDetected(false);
    };

    script.onerror = () => {
      console.warn('Disqus script blocked by client extension or network filter.');
      setIsLoading(false);
      setIsAdBlockerDetected(true);
    };

    (document.head || document.body).appendChild(script);

    // Timeout check: if disqus_thread is still empty after 3 seconds, adblocker is likely active
    setTimeout(() => {
      setIsLoading(false);
      const threadEl = document.getElementById('disqus_thread');
      if (threadEl && threadEl.children.length === 0 && !(window as any).DISQUS) {
        setIsAdBlockerDetected(true);
      }
    }, 2800);
  };

  useEffect(() => {
    loadDisqusScript();
  }, []);

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const newComment: LocalComment = {
      id: `comment-${Date.now()}`,
      author: authorName.trim() || 'Anonymous Trader',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80',
      role: 'Community Member',
      timestamp: 'Just now',
      content: newCommentText.trim(),
      likes: 1,
      liked: true,
      tag: 'General',
    };

    const updated = [newComment, ...localComments];
    saveLocalComments(updated);
    setNewCommentText('');
  };

  const handleToggleLike = (id: string) => {
    const updated = localComments.map((c) => {
      if (c.id === id) {
        return {
          ...c,
          likes: c.liked ? c.likes - 1 : c.likes + 1,
          liked: !c.liked,
        };
      }
      return c;
    });
    saveLocalComments(updated);
  };

  return (
    <section className="mt-12 bg-[#1E222D] rounded-xl border border-[#2A2E39] p-6 shadow-sm">
      {/* Header & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-6 border-b border-[#2A2E39]">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-[#2962ff]" />
          <h2 className="text-xl font-bold font-['Hanken_Grotesk'] text-[#dfe2f2]">
            Trader Community Forum
          </h2>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-2 bg-[#171b26] p-1 rounded-lg border border-[#2A2E39] text-xs">
          <button
            onClick={() => setActiveView('disqus')}
            className={`px-3 py-1.5 rounded font-semibold transition-all flex items-center gap-1.5 ${
              activeView === 'disqus'
                ? 'bg-[#2962ff] text-white shadow-sm'
                : 'text-[#8d90a2] hover:text-white'
            }`}
          >
            <span>Disqus Feed</span>
            {isAdBlockerDetected && (
              <span className="w-2 h-2 rounded-full bg-amber-400" title="AdBlocker Detected" />
            )}
          </button>

          <button
            onClick={() => setActiveView('community')}
            className={`px-3 py-1.5 rounded font-semibold transition-all flex items-center gap-1.5 ${
              activeView === 'community'
                ? 'bg-[#2962ff] text-white shadow-sm'
                : 'text-[#8d90a2] hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>In-App Board (AdBlock Safe)</span>
          </button>
        </div>
      </div>

      {/* AdBlocker Status Alert Banner */}
      {isAdBlockerDetected && (
        <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs leading-relaxed space-y-3">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold text-amber-300 text-sm">
                AdBlocker / Tracking Protection Detected
              </h4>
              <p className="text-[#c3c5d8]">
                Your browser or adblocker extension (uBlock Origin, Brave, Privacy Badger) is blocking the third-party Disqus comment embed.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-amber-500/20">
            <button
              onClick={loadDisqusScript}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Retry Loading Disqus</span>
            </button>

            <a
              href="https://smu-agentic-ai.disqus.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2962ff] hover:bg-[#1e4bd8] text-white font-semibold transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open Forum in New Window</span>
            </a>

            <button
              onClick={() => setActiveView('community')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2A2E39] hover:bg-[#313441] text-white font-semibold transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-[#089981]" />
              <span>Switch to In-App Community Board</span>
            </button>
          </div>
        </div>
      )}

      {/* View Content */}
      {activeView === 'disqus' ? (
        <div className="relative min-h-[220px]">
          {isLoading && !isAdBlockerDetected && (
            <div className="py-12 text-center space-y-2">
              <RefreshCw className="w-6 h-6 text-[#2962ff] animate-spin mx-auto" />
              <p className="text-xs text-[#8d90a2] font-mono">
                Loading Disqus discussion thread...
              </p>
            </div>
          )}

          <div
            ref={disqusContainerRef}
            id="disqus_thread"
            className={`min-h-[200px] ${isAdBlockerDetected ? 'hidden' : 'block'}`}
          />

          <noscript>
            Please enable JavaScript to view the{' '}
            <a href="https://disqus.com/?ref_noscript" rel="noreferrer" className="text-[#2962ff] underline">
              comments powered by Disqus.
            </a>
          </noscript>
        </div>
      ) : (
        /* Fallback / Native In-App Community Forum */
        <div className="space-y-6">
          {/* Post Comment Input */}
          <form onSubmit={handleAddComment} className="bg-[#171b26] p-4 rounded-xl border border-[#2A2E39] space-y-3">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <User className="w-4 h-4 text-[#8d90a2] absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Your username..."
                  className="w-full bg-[#1E222D] text-xs text-white pl-9 pr-3 py-2 rounded-lg border border-[#2A2E39] focus:outline-none focus:border-[#2962ff]"
                />
              </div>
              <span className="text-xs text-[#8d90a2] hidden sm:inline font-mono">Posting live to community</span>
            </div>

            <textarea
              rows={3}
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder="Share market insights, price targets, or technical analysis..."
              className="w-full bg-[#1E222D] text-xs text-white p-3 rounded-lg border border-[#2A2E39] focus:outline-none focus:border-[#2962ff] resize-none"
            />

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!newCommentText.trim()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2962ff] hover:bg-[#1e4bd8] disabled:opacity-50 text-xs font-bold text-white transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Post Insight</span>
              </button>
            </div>
          </form>

          {/* Local Feed */}
          <div className="space-y-3">
            {localComments.map((comment) => (
              <div
                key={comment.id}
                className="bg-[#171b26] p-4 rounded-xl border border-[#2A2E39] space-y-2 transition-all hover:border-[#313441]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={comment.avatar}
                      alt={comment.author}
                      className="w-8 h-8 rounded-full object-cover border border-[#2A2E39]"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-white">{comment.author}</span>
                        <span className="text-[10px] bg-[#2962ff]/15 text-[#b6c4ff] px-2 py-0.5 rounded font-mono font-semibold">
                          {comment.role}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#8d90a2] font-mono">{comment.timestamp}</span>
                    </div>
                  </div>

                  {comment.tag && (
                    <span className="text-[11px] font-mono font-bold text-[#089981] bg-[#089981]/15 px-2.5 py-0.5 rounded">
                      ${comment.tag}
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#dfe2f2] leading-relaxed pt-1 font-sans">
                  {comment.content}
                </p>

                <div className="flex items-center gap-4 pt-2 border-t border-[#2A2E39]/60 text-xs">
                  <button
                    onClick={() => handleToggleLike(comment.id)}
                    className={`flex items-center gap-1.5 font-mono text-[11px] transition-colors ${
                      comment.liked ? 'text-[#2962ff] font-bold' : 'text-[#8d90a2] hover:text-white'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{comment.likes} Likes</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
