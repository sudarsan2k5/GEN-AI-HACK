import { Router } from 'express';
import {
  createPost,
  getAllPosts,
  toggleLikePost,
  addComment,
  deletePost,
  getUserPosts,
} from '../controllers/PostController.js';
import { verifyToken } from '../middlewares/AuthMiddleware.js';

const postRoutes = Router();

// Create a new post
postRoutes.post('/posts', verifyToken, createPost);

// Get all posts (global feed)
postRoutes.get('/posts', verifyToken, getAllPosts);

// Like/Unlike a post
postRoutes.post('/posts/:postId/like', verifyToken, toggleLikePost);

// Add comment to a post
postRoutes.post('/posts/:postId/comment', verifyToken, addComment);

// Delete a post
postRoutes.delete('/posts/:postId', verifyToken, deletePost);

// Get posts by a specific user
postRoutes.get('/posts/user/:userId', verifyToken, getUserPosts);

export default postRoutes;

