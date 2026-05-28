const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const getMyPortfoliosApi = async (token) => {
  const res = await fetch(`${API_BASE_URL}/api/portfolio/my`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "포트폴리오 조회 실패");
  }

  return data;
};

export const uploadPortfolioApi = async (token, formData) => {
  const res = await fetch(`${API_BASE_URL}/api/portfolio/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "포트폴리오 업로드 실패");
  }

  return data;
};

export const getStudentPortfoliosApi = async (token, studentId) => {
  const res = await fetch(`${API_BASE_URL}/api/portfolio/student/${studentId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "학생 작품 조회 실패");
  }

  return data;
};

export const mintPortfolioApi = async (token, portfolioId) => {
  const res = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/api/portfolio/${portfolioId}/mint`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ipfsHash: `QmMockHash${portfolioId}`,
        metadataUrl: `https://example.com/metadata/${portfolioId}.json`,
        tokenId: String(portfolioId),
      }),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "민팅 실패");
  }

  return data;
};

export const getPortfolioDetailApi = async (token, portfolioId) => {
  const res = await fetch(
    `${API_BASE_URL}/api/portfolio/${portfolioId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "작품 상세 조회 실패");
  }

  return data;
};

export async function saveMintResultApi(token, portfolioId, mintData) {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/api/portfolio/${portfolioId}/mint`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(mintData),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.message || "NFT 정보 저장 실패");
  }

  return data;
}
export async function prepareMintApi(token, portfolioId) {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/api/portfolio/${portfolioId}/prepare-mint`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const text = await response.text();
  console.log("prepareMintApi raw response:", text);

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`JSON이 아닌 응답이 왔습니다: ${text.slice(0, 100)}`);
  }

  if (!response.ok) {
    throw new Error(data.error || data.message || "민팅 준비 실패");
  }

  return data;
}

export async function getRecentPortfoliosApi() {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/api/portfolio/public/recent`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "최신 작품 조회 실패");
  }

  return data;
}

export async function getCertifiedPortfoliosApi() {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/api/portfolio/public/certified`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "NFT 인증 작품 조회 실패");
  }

  return data;
}

export async function getPublicPortfoliosApi({
  search = "",
  category = "전체",
  minted = "all",
} = {}) {
  const params = new URLSearchParams();

  params.set("search", search);
  params.set("category", category);
  params.set("minted", minted);

  const response = await fetch(
    `${API_BASE_URL}/api/portfolio/public/list?${params.toString()}`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "작품 목록 조회 실패");
  }

  return data;
}