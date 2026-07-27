
import Layout from "./components/Layout/Layout";
import Hero from "./components/Hero/Hero";
import PostPage from "./components/PostPage/PostPage";
import PostList from "./components/PostList/PostList";
import { posts } from "./lib/posts.js";
import { Route, Routes } from "react-router-dom";

function App() {
  return (
    <Layout>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Hero />
              <PostList posts={posts} />
            </>
          }
        />
        <Route path="/posts/:slug" element={<PostPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
