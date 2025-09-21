import { useState, useRef, useEffect } from "react";
import { useAppStore } from "@/store";
import { apiClient } from "@/lib/api-client";
import { 
  CREATE_POST_ROUTE, 
  GET_ALL_POSTS_ROUTE, 
  LIKE_POST_ROUTE, 
  COMMENT_POST_ROUTE,
  DELETE_POST_ROUTE 
} from "@/utils/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Heart, MessageCircle, Trash2, Share2, User } from "lucide-react";
import { toast } from "sonner";

const SocialMediaFeed = () => {
  const { 
    userInfo, 
    posts, 
    postsLoading, 
    setPosts, 
    setPostsLoading, 
    addPost, 
    updatePost, 
    removePost 
  } = useAppStore();
  
  const [newPostContent, setNewPostContent] = useState("");
  const [commentInputs, setCommentInputs] = useState({});
  const feedRef = useRef(null);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setPostsLoading(true);
    try {
      const response = await apiClient.get(GET_ALL_POSTS_ROUTE, { 
        withCredentials: true 
      });
      if (response.data.success) {
        setPosts(response.data.posts);
      }
    } catch (error) {
      console.error("Error loading posts:", error);
      toast.error("Failed to load posts");
    } finally {
      setPostsLoading(false);
    }
  };

  const createPost = async () => {
    if (!newPostContent.trim()) return;

    try {
      const response = await apiClient.post(
        CREATE_POST_ROUTE,
        { content: newPostContent },
        { withCredentials: true }
      );

      if (response.data.success) {
        setNewPostContent("");
        // Post will be added via socket.io real-time update
        toast.success("Post shared successfully!");
      }
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to create post");
    }
  };

  const likePost = async (postId) => {
    try {
      const response = await apiClient.post(
        `${LIKE_POST_ROUTE}/${postId}/like`,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        // Post will be updated via socket.io
      }
    } catch (error) {
      console.error("Error liking post:", error);
      toast.error("Failed to like post");
    }
  };

  const addComment = async (postId) => {
    const commentContent = commentInputs[postId];
    if (!commentContent || !commentContent.trim()) return;

    try {
      const response = await apiClient.post(
        `${COMMENT_POST_ROUTE}/${postId}/comment`,
        { content: commentContent },
        { withCredentials: true }
      );

      if (response.data.success) {
        setCommentInputs({ ...commentInputs, [postId]: "" });
        // Post will be updated via socket.io
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    }
  };

  const deletePost = async (postId) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      const response = await apiClient.delete(
        `${DELETE_POST_ROUTE}/${postId}`,
        { withCredentials: true }
      );

      if (response.data.success) {
        removePost(postId);
        toast.success("Post deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Failed to delete post");
    }
  };

  const handleCommentInputChange = (postId, value) => {
    setCommentInputs({ ...commentInputs, [postId]: value });
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const isLikedByUser = (post) => {
    return post.likes && post.likes.includes(userInfo.id);
  };

  return (
    <div className="h-full flex flex-col bg-[#1c1d25]">
      {/* Header */}
      <div className="p-4 border-b border-[#2f303b]">
        <div className="flex items-center gap-3 mb-4">
          <Share2 className="w-6 h-6 text-purple-400" />
          <h2 className="text-xl font-semibold text-white">Social Media Feed</h2>
        </div>
        
        {/* Create Post */}
        <div className="space-y-3">
          <textarea
            placeholder="What's on your mind? Share your thoughts with everyone..."
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            className="w-full p-3 bg-[#2a2b33] border border-[#2f303b] rounded-lg text-white placeholder-neutral-400 resize-none"
            rows={3}
            maxLength={500}
          />
          <div className="flex justify-between items-center">
            <span className="text-xs text-neutral-400">
              {newPostContent.length}/500 characters
            </span>
            <Button
              onClick={createPost}
              disabled={!newPostContent.trim()}
              className="bg-[#8417ff] hover:bg-[#7c3aed]"
            >
              <Send className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </div>

      {/* Posts Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={feedRef}>
        {postsLoading ? (
          <div className="text-center text-neutral-400 py-8">
            <div className="animate-spin w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full mx-auto mb-4"></div>
            Loading posts...
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center text-neutral-400 py-8">
            <Share2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No posts yet. Be the first to share something!</p>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post._id} className="bg-[#2a2b33] rounded-lg border border-[#2f303b] p-4">
              {/* Post Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center">
                    {post.author?.profilePicture ? (
                      <img
                        src={post.author.profilePicture}
                        alt={post.author.firstName}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-white font-medium">
                      {post.author?.firstName} {post.author?.lastName}
                    </h4>
                    <p className="text-xs text-neutral-400">
                      {formatTime(post.createdAt)}
                    </p>
                  </div>
                </div>
                {post.author?._id === userInfo.id && (
                  <Button
                    onClick={() => deletePost(post._id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {/* Post Content */}
              <p className="text-neutral-200 mb-4 whitespace-pre-wrap">
                {post.content}
              </p>

              {/* Post Actions */}
              <div className="flex items-center gap-4 mb-4">
                <Button
                  onClick={() => likePost(post._id)}
                  variant="ghost"
                  size="sm"
                  className={`flex items-center gap-2 ${
                    isLikedByUser(post)
                      ? "text-red-400 hover:text-red-300"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  <Heart
                    className={`w-4 h-4 ${isLikedByUser(post) ? "fill-current" : ""}`}
                  />
                  {post.likes?.length || 0}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2 text-neutral-400 hover:text-white"
                >
                  <MessageCircle className="w-4 h-4" />
                  {post.comments?.length || 0}
                </Button>
              </div>

              {/* Comments */}
              {post.comments && post.comments.length > 0 && (
                <div className="space-y-2 mb-4">
                  {post.comments.map((comment, index) => (
                    <div key={index} className="bg-[#1c1d25] rounded p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 rounded-full bg-purple-400 flex items-center justify-center">
                          {comment.author?.profilePicture ? (
                            <img
                              src={comment.author.profilePicture}
                              alt={comment.author.firstName}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <User className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <span className="text-sm font-medium text-white">
                          {comment.author?.firstName} {comment.author?.lastName}
                        </span>
                        <span className="text-xs text-neutral-400">
                          {formatTime(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-200 ml-8">
                        {comment.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Comment */}
              <div className="flex gap-2">
                <Input
                  placeholder="Write a comment..."
                  value={commentInputs[post._id] || ""}
                  onChange={(e) => handleCommentInputChange(post._id, e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      addComment(post._id);
                    }
                  }}
                  className="flex-1 bg-[#1c1d25] border-[#2f303b] text-white placeholder-neutral-400"
                />
                <Button
                  onClick={() => addComment(post._id)}
                  disabled={!commentInputs[post._id]?.trim()}
                  size="sm"
                  className="bg-[#8417ff] hover:bg-[#7c3aed]"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SocialMediaFeed;

