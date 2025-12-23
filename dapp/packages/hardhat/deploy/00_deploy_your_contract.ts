import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

/**
 * Deploys the TodoList contract
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployTodoList: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;
  
  await deploy("TodoList", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });
};

export default deployTodoList;

// Тег для выборочного деплоя
deployTodoList.tags = ["TodoList"];
