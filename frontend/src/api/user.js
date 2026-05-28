export async function saveWalletAddressApi(token, walletAddress) {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/api/user/wallet`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ walletAddress }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.message || "지갑 주소 저장 실패");
  }

  return data;
}

export async function getMyWalletAddressApi(token) {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/api/user/me/wallet`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.message || "지갑 주소 조회 실패");
  }

  return data;
}

export async function getMeApi(token) {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/api/user/me`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.message || "사용자 정보 조회 실패");
  }

  return data;
}

export async function changePasswordApi(token, currentPassword, newPassword) {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/api/user/profile/password`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.message || "비밀번호 변경 실패");
  }

  return data;
}

export async function deleteWalletAddressApi(token) {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/api/user/wallet`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.message || "지갑 삭제 실패");
  }

  return data;
}