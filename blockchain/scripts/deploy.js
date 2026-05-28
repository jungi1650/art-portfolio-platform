async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("배포 지갑 주소:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("잔액:", ethers.formatEther(balance), "ETH");

  const Factory = await ethers.getContractFactory("StudentArtNFT");
  const contract = await Factory.deploy(deployer.address);

  await contract.waitForDeployment();

  console.log("컨트랙트 주소:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});