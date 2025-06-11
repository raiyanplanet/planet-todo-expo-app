import React from "react";
import { FlatList } from "react-native";
import TodoItem from "./TodoItem";

export default function TodoList({
  todos,
  onDelete,
}: {
  todos: { id: string; content: string }[];
  onDelete: (id: string) => void;
}) {
  return (
    <FlatList
      data={todos}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TodoItem content={item.content} onDelete={() => onDelete(item.id)} />
      )}
    />
  );
}
