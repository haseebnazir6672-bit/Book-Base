function PostFeed({
  statusMsg,
  feed,
  isAdmin,
  hubUser,
  toggleLike,
  removePost,
  moderatePost,
  commentDrafts,
  setCommentDrafts,
  submitComment,
}) {
  return (
    <section className="space-y-4">
      {statusMsg && <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">{statusMsg}</div>}
      {feed.map((post) => (
        <article key={post._id} className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">{post.title}</h3>
              <p className="text-xs text-slate-500">{post.author?.name} | {post.department} | {post.contentType.replace('_', ' ')}</p>
            </div>
            <div className="flex gap-2">
              <button type="button" className="rounded-lg border px-2 py-1 text-xs" onClick={() => toggleLike(post._id)}>Like ({post.likes?.length || 0})</button>
              {(isAdmin || post.author?._id === hubUser?._id) && <button type="button" className="rounded-lg border border-rose-300 px-2 py-1 text-xs text-rose-600" onClick={() => removePost(post._id)}>Delete</button>}
              {isAdmin && <button type="button" className="rounded-lg border border-amber-300 px-2 py-1 text-xs text-amber-700" onClick={() => moderatePost(post._id, 'removed')}>Moderate</button>}
            </div>
          </div>
          <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">{post.body}</p>
          {post.attachments?.length > 0 && (
            <div className="mt-3 rounded-lg bg-slate-50 p-2 text-xs text-slate-600">
              {post.attachments.map((att, idx) => (
                <a key={`${post._id}-att-${idx}`} className="block underline" href={att.url} target="_blank" rel="noreferrer">
                  {att.kind}: {att.url}
                </a>
              ))}
            </div>
          )}
          <div className="mt-3 space-y-2 border-t pt-3">
            <h4 className="text-xs font-bold uppercase text-slate-500">Comments</h4>
            {post.comments?.slice(0, 3).map((comment) => (
              <p key={comment._id} className="text-sm text-slate-700">
                <span className="font-semibold">{comment.user?.name || 'User'}:</span> {comment.text}
              </p>
            ))}
            <div className="flex gap-2">
              <input className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="Write a comment" value={commentDrafts[post._id] || ''} onChange={(e) => setCommentDrafts((prev) => ({ ...prev, [post._id]: e.target.value }))} />
              <button type="button" className="rounded-lg bg-slate-900 px-3 py-2 text-sm text-white" onClick={() => submitComment(post._id)}>Post</button>
            </div>
          </div>
        </article>
      ))}
      {feed.length === 0 && (
        <div className="rounded-xl border bg-white p-8 text-center text-sm text-slate-500">
          No posts found for current filters.
        </div>
      )}
    </section>
  )
}

export default PostFeed
