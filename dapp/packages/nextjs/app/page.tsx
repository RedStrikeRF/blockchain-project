"use client";

import { useState, useEffect } from "react";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { useAccount } from "wagmi";

type Task = {
  text: string;
  completed: boolean;
};

export default function TodoListPage() {
  const [newTask, setNewTask] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const { address, isConnected } = useAccount();
  
  // Хук для чтения задач с контракта
  const { data: contractTasks, refetch: refetchTasks } = useScaffoldReadContract({
    contractName: "TodoList",
    functionName: "getTasks",
  });
  
  // Хук для записи в контракт
  const { writeContractAsync } = useScaffoldWriteContract({
    contractName: "TodoList"
  });
  
  // Обновляем локальное состояние при изменении данных контракта
  useEffect(() => {
    if (contractTasks) {
      const tasksArray = contractTasks as Task[];
      setTasks(tasksArray);
    }
  }, [contractTasks]);
  
  // Добавление новой задачи
  const handleAddTask = async () => {
    if (!newTask.trim() || !isConnected) {
      alert("Please connect wallet and enter task text");
      return;
    }
    
    try {
      // Отправляем транзакцию и ждём подтверждения 1 блока
      await writeContractAsync(
        {
          functionName: "addTask",
          args: [newTask.trim()],
        },
        {
          blockConfirmations: 1,
          onBlockConfirmation: () => {
            // Обновляем список задач после подтверждения
            refetchTasks();
            setNewTask("");
          },
        }
      );
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };
  
  // Переключение статуса задачи
  const handleToggleTask = async (index: number) => {
    if (!isConnected) return;
    
    try {
      await writeContractAsync(
        {
          functionName: "toggleTask",
          args: [BigInt(index)],
        },
        {
          blockConfirmations: 1,
          onBlockConfirmation: () => {
            // Обновляем список задач после подтверждения блока
            refetchTasks();
          },
        }
      );
    } catch (error) {
      console.error("Error toggling task:", error);
    }
  };
  
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">✅ Blockchain Todo List</h1>
        <p className="text-gray-600 mb-4">
          Tasks stored permanently on the Ethereum blockchain
        </p>
        
        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <p className="text-sm">
            Status:{" "}
            {isConnected ? (
              <span className="text-green-600">
                🔗 Connected ({address?.slice(0, 6)}...{address?.slice(-4)})
              </span>
            ) : (
              <span className="text-red-600">🔒 Wallet not connected</span>
            )}
          </p>
        </div>
      </header>
      
      {/* Форма добавления задачи */}
      <div className="mb-8 p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Add New Task</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-3"
            placeholder="Enter task description..."
            disabled={!isConnected}
          />
          <button
            onClick={handleAddTask}
            disabled={!newTask.trim() || !isConnected}
            className={`px-6 py-3 rounded-lg font-medium ${
              !newTask.trim() || !isConnected
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            Add Task
          </button>
        </div>
        {!isConnected && (
          <p className="mt-2 text-sm text-red-600">
            ⚠️ Connect your wallet to add tasks
          </p>
        )}
      </div>
      
      {/* Список задач */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Tasks</h2>
          <span className="bg-gray-200 px-3 py-1 rounded-full text-sm">
            {tasks.length} total
          </span>
        </div>
        
        {tasks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {isConnected
                ? "No tasks yet. Add your first task above!"
                : "Connect your wallet to see tasks"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-4 rounded-lg ${
                  task.completed ? "bg-green-50" : "bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggleTask(index)}
                    disabled={!isConnected}
                    className={`w-5 h-5 rounded border-2 ${
                      task.completed
                        ? "bg-green-500 border-green-500"
                        : "border-gray-400"
                    }`}
                  >
                    {task.completed && (
                      <span className="text-white text-xs">✓</span>
                    )}
                  </button>
                  <span
                    className={task.completed ? "line-through text-gray-500" : ""}
                  >
                    {task.text}
                  </span>
                </div>
                <span
                  className={`text-sm px-2 py-1 rounded ${
                    task.completed
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {task.completed ? "Completed" : "Pending"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}