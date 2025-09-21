import Post from "../models/PostModel.js";
import User from "../models/Usermodel.js";

// Create a new post
const createPost = async (req, res) => {
  try {
    const { content, image } = req.body;
    const userId = req.user.id;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: "Post content is required" });
    }

    if (content.length > 500) {
      return res.status(400).json({ error: "Post content must be 500 characters or less" });
    }

    const newPost = new Post({
      author: userId,
      content: content.trim(),
      image: image || null,
    });

    await newPost.save();

    // Populate author information for the response
    const populatedPost = await Post.findById(newPost._id)
      .populate("author", "firstName lastName email profilePicture")
      .populate("comments.author", "firstName lastName profilePicture");

    // Broadcast new post to all users via socket.io
    if (global.socketFunctions && global.socketFunctions.broadcastNewPost) {
      global.socketFunctions.broadcastNewPost(populatedPost);
    }

    res.status(201).json({
      success: true,
      post: populatedPost,
      message: "Post created successfully",
    });
  } catch (error) {
    console.error("Create post error:", error);
    res.status(500).json({
      error: "Failed to create post",
      details: error.message,
    });
  }
};

// Get all posts (global feed)
const getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ isPublic: true })
      .populate("author", "firstName lastName email profilePicture")
      .populate("comments.author", "firstName lastName profilePicture")
      .sort({ createdAt: -1 }) // Newest first
      .skip(skip)
      .limit(limit);

    const totalPosts = await Post.countDocuments({ isPublic: true });
    const totalPages = Math.ceil(totalPosts / limit);

    res.json({
      success: true,
      posts,
      pagination: {
        currentPage: page,
        totalPages,
        totalPosts,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Get posts error:", error);
    res.status(500).json({
      error: "Failed to get posts",
      details: error.message,
    });
  }
};

// Like/Unlike a post
const toggleLikePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      // Unlike the post
      post.likes = post.likes.filter(id => id.toString() !== userId.toString());
    } else {
      // Like the post
      post.likes.push(userId);
    }

    await post.save();

    const updatedPost = await Post.findById(postId)
      .populate("author", "firstName lastName email profilePicture")
      .populate("comments.author", "firstName lastName profilePicture");

    // Broadcast post update to all users
    if (global.socketFunctions && global.socketFunctions.broadcastPostUpdate) {
      global.socketFunctions.broadcastPostUpdate(updatedPost);
    }

    res.json({
      success: true,
      post: updatedPost,
      action: isLiked ? "unliked" : "liked",
    });
  } catch (error) {
    console.error("Toggle like error:", error);
    res.status(500).json({
      error: "Failed to toggle like",
      details: error.message,
    });
  }
};

// Add comment to a post
const addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: "Comment content is required" });
    }

    if (content.length > 200) {
      return res.status(400).json({ error: "Comment must be 200 characters or less" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const newComment = {
      author: userId,
      content: content.trim(),
      createdAt: new Date(),
    };

    post.comments.push(newComment);
    await post.save();

    const updatedPost = await Post.findById(postId)
      .populate("author", "firstName lastName email profilePicture")
      .populate("comments.author", "firstName lastName profilePicture");

    // Broadcast post update to all users
    if (global.socketFunctions && global.socketFunctions.broadcastPostUpdate) {
      global.socketFunctions.broadcastPostUpdate(updatedPost);
    }

    res.json({
      success: true,
      post: updatedPost,
      message: "Comment added successfully",
    });
  } catch (error) {
    console.error("Add comment error:", error);
    res.status(500).json({
      error: "Failed to add comment",
      details: error.message,
    });
  }
};

// Delete a post (only by author)
const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Check if user is the author
    if (post.author.toString() !== userId.toString()) {
      return res.status(403).json({ error: "You can only delete your own posts" });
    }

    await Post.findByIdAndDelete(postId);

    res.json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error("Delete post error:", error);
    res.status(500).json({
      error: "Failed to delete post",
      details: error.message,
    });
  }
};

// Get posts by a specific user
const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ author: userId, isPublic: true })
      .populate("author", "firstName lastName email profilePicture")
      .populate("comments.author", "firstName lastName profilePicture")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPosts = await Post.countDocuments({ author: userId, isPublic: true });

    res.json({
      success: true,
      posts,
      totalPosts,
    });
  } catch (error) {
    console.error("Get user posts error:", error);
    res.status(500).json({
      error: "Failed to get user posts",
      details: error.message,
    });
  }
};

export {
  createPost,
  getAllPosts,
  toggleLikePost,
  addComment,
  deletePost,
  getUserPosts,
};
