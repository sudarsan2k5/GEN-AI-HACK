import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 500, // Limit post length
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [
      {
        author: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        content: {
          type: String,
          required: true,
          maxlength: 200,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    image: {
      type: String, // URL to uploaded image
      default: null,
    },
    isPublic: {
      type: Boolean,
      default: true, // All posts are public by default
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
postSchema.index({ createdAt: -1 }); // Sort by newest first
postSchema.index({ author: 1 });

const Post = mongoose.model("Posts", postSchema);

export default Post;
