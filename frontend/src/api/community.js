const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const authHeaders = (token) => {
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getCommunityPostsApi = async (token, boardType = "community") => {
  const res = await fetch(
    `${API_BASE_URL}/api/community/posts?boardType=${boardType}`,
    {
      headers: authHeaders(token),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "게시글 목록 조회 실패");
  }

  return data;
};

export const createCommunityPostApi = async (token, payload) => {
  const formData = new FormData();

  formData.append("title", payload.title);
  formData.append("content", payload.content);
  formData.append("category", payload.category);
  formData.append("boardType", payload.boardType || "community");

  if (payload.image) {
    formData.append("image", payload.image);
  }

  const res = await fetch(`${API_BASE_URL}/api/community/posts`, {
    method: "POST",
    headers: {
      ...authHeaders(token),
    },
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "게시글 작성 실패");
  }

  return data;
};

export const getCommunityPostDetailApi = async (token, postId) => {
  const res = await fetch(`${API_BASE_URL}/api/community/posts/${postId}`, {
    headers: authHeaders(token),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "게시글 상세 조회 실패");
  }

  return data;
};

export const createCommunityCommentApi = async (token, postId, content) => {
  const res = await fetch(
    `${API_BASE_URL}/api/community/posts/${postId}/comments`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(token),
      },
      body: JSON.stringify({ content }),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "댓글 작성 실패");
  }

  return data;
};

export const deleteCommunityPostApi = async (token, postId) => {
  const res = await fetch(`${API_BASE_URL}/api/community/posts/${postId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "게시글 삭제 실패");
  }

  return data;
};