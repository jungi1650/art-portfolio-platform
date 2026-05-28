const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const getMyStudentsApi = async (token) => {
  const res = await fetch(`${API_BASE_URL}/api/parent/my-students`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "자녀 목록 조회 실패");
  }

  return data;
};

export const linkStudentApi = async (token, studentEmail) => {
  const res = await fetch(`${API_BASE_URL}/api/parent/link-student`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ studentEmail }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "학생 연결 실패");
  }

  return data;
};