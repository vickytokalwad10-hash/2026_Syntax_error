import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useNetwork } from '../context/NetworkContext';
import { cacheData, getCachedData, enqueueOfflineAction } from '../services/offlineDb';

export default function CommunityPage() {
  const { t } = useLanguage();
  const { isOnline, refreshPendingCount } = useNetwork();
  const [posts, setPosts] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postCrop, setPostCrop] = useState('Wheat');
  const [postContent, setPostContent] = useState('');
  const [commentInputs, setCommentInputs] = useState({});
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, [selectedCrop]);

  const fetchPosts = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/community/posts?crop=${selectedCrop}`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
        await cacheData('community_posts', data.posts);
      }
    } catch (e) {
      const cached = await getCachedData('community_posts');
      if (cached) setPosts(cached);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    const payload = {
      author_name: 'Ramesh Patil',
      author_location: 'Nashik, Maharashtra',
      crop_tag: postCrop,
      title: postTitle,
      content: postContent
    };

    if (!isOnline) {
      await enqueueOfflineAction('COMMUNITY_POST', payload);
      await refreshPendingCount();
      setShowCreateModal(false);
      setToast('📡 Offline Mode: Post queued. Will publish to forum once reconnected.');
      setTimeout(() => setToast(null), 4000);
      return;
    }

    try {
      const res = await fetch('http://127.0.0.1:8000/api/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        setPosts([data.post, ...posts]);
        setShowCreateModal(false);
        setPostTitle('');
        setPostContent('');
        setToast('🎉 Discussion post published to the community!');
        setTimeout(() => setToast(null), 4000);
      }
    } catch (err) {
      setToast('Error creating post.');
    }
  };

  const handleUpvote = async (postId) => {
    // Optimistic UI update
    setPosts(
      posts.map((p) => {
        if (p.id === postId) {
          const upvoted = !p.upvoted_by_me;
          return {
            ...p,
            upvoted_by_me: upvoted,
            upvotes: p.upvotes + (upvoted ? 1 : -1)
          };
        }
        return p;
      })
    );

    try {
      await fetch(`http://127.0.0.1:8000/api/community/upvote/${postId}`, { method: 'POST' });
    } catch (e) {
      // Ignore in offline mode
    }
  };

  const handleAddComment = async (postId) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    const payload = {
      post_id: postId,
      author_name: 'Ramesh Patil',
      comment_text: text.trim()
    };

    try {
      const res = await fetch('http://127.0.0.1:8000/api/community/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        setPosts(
          posts.map((p) => {
            if (p.id === postId) {
              return { ...p, comments: [...p.comments, data.comment] };
            }
            return p;
          })
        );
        setCommentInputs({ ...commentInputs, [postId]: '' });
      }
    } catch (e) {
      setToast('Offline: Comments sync when online.');
      setTimeout(() => setToast(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div className="bg-brand-600 text-white px-4 py-3 rounded-2xl shadow-floating flex items-center justify-between text-xs font-bold animate-in zoom-in-95">
          <span>{toast}</span>
          <button onClick={() => setToast(null)} className="text-white hover:opacity-80">✕</button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <span className="material-symbols-outlined text-brand-600 text-[32px]">groups</span>
            {t('community.title')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-3xl mt-1">
            {t('community.subtitle')}
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-xs transition active:scale-95 flex items-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[16px]">edit_square</span>
          {t('community.startDiscussion')}
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        {['All', 'Wheat', 'Mustard', 'Soybean', 'Paddy'].map((crop) => (
          <button
            key={crop}
            onClick={() => setSelectedCrop(crop)}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              selectedCrop === crop
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {crop === 'All' ? '🌐 All Discussions' : `🌾 ${crop}`}
          </button>
        ))}
      </div>

      {/* Discussion Feed */}
      <div className="space-y-4">
        {posts.map((post) => (
          <div
            key={post.id}
            className={`glass-card p-5 space-y-3 ${
              post.is_success_story ? 'border-l-4 border-l-amber-500 bg-amber-50/10' : ''
            }`}
          >
            {/* Author Header */}
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-800 font-bold flex items-center justify-center text-xs">
                  {post.author_name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-extrabold text-slate-900">{post.author_name}</h4>
                    {post.is_success_story && (
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.2 rounded-md">
                        🏆 Success Story
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500">📍 {post.author_location} • {post.created_at}</span>
                </div>
              </div>

              <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md">
                🌾 {post.crop_tag}
              </span>
            </div>

            {/* Post Body */}
            <div>
              <h5 className="text-sm font-extrabold text-slate-900 mb-1">{post.title}</h5>
              <p className="text-xs text-slate-700 font-medium leading-relaxed">{post.content}</p>
            </div>

            {/* Actions & Upvote */}
            <div className="flex items-center gap-4 pt-2 border-t border-slate-100 text-xs font-bold text-slate-600">
              <button
                onClick={() => handleUpvote(post.id)}
                className={`flex items-center gap-1 px-3 py-1 rounded-xl transition ${
                  post.upvoted_by_me ? 'bg-emerald-100 text-emerald-800' : 'hover:bg-slate-100'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">thumb_up</span>
                <span>{post.upvotes} Upvotes</span>
              </button>

              <span className="flex items-center gap-1 text-slate-400">
                <span className="material-symbols-outlined text-[16px]">chat</span>
                <span>{post.comments.length} Comments</span>
              </span>
            </div>

            {/* Comments Thread */}
            {post.comments.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100/60 pl-3">
                {post.comments.map((c) => (
                  <div key={c.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 mb-0.5">
                      <span>{c.author_name} ({c.author_location})</span>
                      <span>{c.created_at}</span>
                    </div>
                    <p className="text-slate-800 font-medium">{c.text}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Add Comment Input */}
            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={commentInputs[post.id] || ''}
                onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                placeholder={t('community.replyPlaceholder')}
                className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-brand-600"
              />
              <button
                onClick={() => handleAddComment(post.id)}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition active:scale-95"
              >
                Reply
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-floating border border-slate-200 animate-in zoom-in-95">
            <h4 className="text-base font-extrabold text-slate-900 mb-3">{t('community.startDiscussion')}</h4>
            <form onSubmit={handleCreatePost} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Related Crop</label>
                <select
                  value={postCrop}
                  onChange={(e) => setPostCrop(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  <option value="Wheat">Wheat</option>
                  <option value="Mustard">Mustard</option>
                  <option value="Soybean">Soybean</option>
                  <option value="Paddy">Paddy / Rice</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Topic Title</label>
                <input
                  type="text"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  placeholder="e.g. Tips on managing water during CRI stage in sandy loam..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Details & Field Context</label>
                <textarea
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  rows="4"
                  placeholder={t('community.questionPlaceholder')}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl resize-none font-medium"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-xs active:scale-95"
                >
                  Publish Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
