import { expect } from "chai";
import { ethers } from "hardhat";
import { TodoList } from "../typechain-types";

describe("TodoList smart contract", function () {
  let todoList: TodoList;
  
  beforeEach(async () => {
    const TodoListFactory = await ethers.getContractFactory("TodoList");
    todoList = await TodoListFactory.deploy();
    await todoList.waitForDeployment();
  });
  
  // ======================================================
  // 1. Initial state
  // ======================================================
  
  describe("1. Initial state", () => {
    it("1.1 Should start with an empty tasks list", async () => {
      const tasks = await todoList.getTasks();
      expect(tasks.length).to.equal(0);
    });
  });
  
  // ======================================================
  // 2. addTask()
  // ======================================================
  
  describe("2. addTask()", () => {
    it("2.1 Should add a new task with completed = false", async () => {
      await todoList.addTask("Learn Solidity");
      
      const tasks = await todoList.getTasks();
      expect(tasks.length).to.equal(1);
      expect(tasks[0].text).to.equal("Learn Solidity");
      expect(tasks[0].completed).to.equal(false);
    });
    
    it("2.2 Should emit TaskAdded event with correct index and text", async () => {
      await expect(todoList.addTask("Write tests"))
        .to.emit(todoList, "TaskAdded")
        .withArgs(0, "Write tests");
    });
  });
  
  // ======================================================
  // 3. toggleTask()
  // ======================================================
  
  describe("3. toggleTask()", () => {
    it("3.1 Should toggle task completion from false to true", async () => {
      await todoList.addTask("Toggle me");
      
      await todoList.toggleTask(0);
      const tasks = await todoList.getTasks();
      
      expect(tasks[0].completed).to.equal(true);
    });
    
    it("3.2 Should toggle task completion from true back to false", async () => {
      await todoList.addTask("Toggle twice");
      
      await todoList.toggleTask(0);
      await todoList.toggleTask(0);
      
      const tasks = await todoList.getTasks();
      expect(tasks[0].completed).to.equal(false);
    });
    
    it("3.3 Should emit TaskToggled event with correct index and status", async () => {
      await todoList.addTask("Emit toggle event");
      
      await expect(todoList.toggleTask(0))
        .to.emit(todoList, "TaskToggled")
        .withArgs(0, true);
    });
    
    it("3.4 Should revert if task index does not exist", async () => {
      await expect(todoList.toggleTask(0))
        .to.be.revertedWith("Task does not exist");
    });
  });
});
