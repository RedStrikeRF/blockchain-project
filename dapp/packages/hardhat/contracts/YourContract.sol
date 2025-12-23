// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TodoList {
    struct Task {
        string text;
        bool completed;
    }

    Task[] private tasks;

    event TaskAdded(uint256 index, string text);
    event TaskToggled(uint256 index, bool completed);

    // Добавление задачи
    function addTask(string calldata _text) external {
        tasks.push(Task({
            text: _text,
            completed: false
        }));

        emit TaskAdded(tasks.length - 1, _text);
    }

    // Переключение статуса задачи
    function toggleTask(uint256 _index) external {
        require(_index < tasks.length, "Task does not exist");

        tasks[_index].completed = !tasks[_index].completed;

        emit TaskToggled(_index, tasks[_index].completed);
    }

    // Получение всех задач
    function getTasks() external view returns (Task[] memory) {
        return tasks;
    }
}
