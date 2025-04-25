import React, { useEffect, useState } from "react";
import axios from "axios";

const Blog = () => {
  const [blogs, setBlogs] = useState([]); // Список записів блогу
  const [selectedBlog, setSelectedBlog] = useState(null); // Вибраний запис блогу
  const [comments, setComments] = useState([]); // Коментарі до посту
  const [newComment, setNewComment] = useState(""); // Новий коментар
  const [isCreatingPost, setIsCreatingPost] = useState(false); // Створення нового посту
  const [newPost, setNewPost] = useState({ title: "", content: "", author_id: "" }); // Новий пост

  // Завантаження списку записів блогу
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await axios.get("/blogs");
        setBlogs(response.data);
      } catch (error) {
        console.error("Error fetching blogs:", error);
      }
    };
    fetchBlogs();
  }, []);

  // Завантаження коментарів до вибраного блогу
  const fetchComments = async (blogId) => {
    try {
      const response = await axios.get(`/comments/${blogId}`);
      setComments(response.data);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  // Обробка вибору запису блогу
  const handleSelectBlog = async (blog) => {
    setSelectedBlog(blog);
    fetchComments(blog.id);
  };

  // Додавання нового коментаря
  const handleAddComment = async () => {
    try {
      const response = await axios.post("/comments", {
        blog_id: selectedBlog.id,
        comment: newComment,
      });
      setComments([...comments, response.data]);
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  // Переключення до форми створення посту
  const toggleCreatePost = () => {
    setIsCreatingPost(!isCreatingPost);
  };

  // Додавання нового посту
  const handleCreatePost = async () => {
    try {
      await axios.post("/blog-posts", newPost);
      alert("Post created successfully!");
      setIsCreatingPost(false);
      setNewPost({ title: "", content: "", author_id: "" });
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  return (
    <div>
      <h1>Blog</h1>

      {/* Список записів блогу */}
      {!selectedBlog && !isCreatingPost && (
        <div>
          <button onClick={toggleCreatePost}>Create New Post</button>
          <ul>
            {blogs.map((blog) => (
              <li key={blog.id}>
                <h3>{blog.title}</h3>
                <p>{blog.description}</p>
                <p>Type: {blog.type}</p>
                <button onClick={() => handleSelectBlog(blog)}>View Details</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Деталі посту та коментарі */}
      {selectedBlog && (
        <div>
          <button onClick={() => setSelectedBlog(null)}>Back to List</button>
          <h2>{selectedBlog.title}</h2>
          <p>{selectedBlog.description}</p>

          <h3>Comments</h3>
          <ul>
            {comments.map((comment) => (
              <li key={comment.id}>{comment.comment}</li>
            ))}
          </ul>
          <textarea
            placeholder="Add a comment"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button onClick={handleAddComment}>Submit</button>
        </div>
      )}

      {/* Форма створення нового посту */}
      {isCreatingPost && (
        <div>
          <button onClick={toggleCreatePost}>Back to List</button>
          <h2>Create New Post</h2>
          <input
            type="text"
            placeholder="Title"
            value={newPost.title}
            onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
          />
          <textarea
            placeholder="Content"
            value={newPost.content}
            onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
          />
          <input
            type="text"
            placeholder="Author ID"
            value={newPost.author_id}
            onChange={(e) => setNewPost({ ...newPost, author_id: e.target.value })}
          />
          <button onClick={handleCreatePost}>Create Post</button>
        </div>
      )}
    </div>
  );
};

export default Blog;
