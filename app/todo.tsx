// app/todo.tsx
import { SignedIn } from "@clerk/clerk-expo";
import React, { useState } from "react";
import {
  Button,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import SignOut from "./components/SignOutButton";

const TodoScreen = () => {
  const [todo, setTodo] = useState("");
  const [todos, setTodos] = useState<string[]>([]);

  const addTodo = () => {
    if (todo.trim() === "") return;
    setTodos([...todos, todo]);
    setTodo("");
  };

  const deleteTodo = (index: number) => {
    const updated = [...todos];
    updated.splice(index, 1);
    setTodos(updated);
  };

  return (
    <SignedIn>
      <View style={styles.container}>
        <Text style={styles.title}>My Todos</Text>

        <View style={styles.inputContainer}>
          <TextInput
            value={todo}
            onChangeText={setTodo}
            placeholder="Enter a todo"
            style={styles.input}
          />
          <Button title="Add" onPress={addTodo} />
        </View>

        <FlatList
          data={todos}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <View style={styles.todoItem}>
              <Text>{item}</Text>
              <TouchableOpacity onPress={() => deleteTodo(index)}>
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
        />

        <SignOut />
      </View>
    </SignedIn>
  );
};

export default TodoScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: "row",
    marginBottom: 20,
    gap: 10,
    alignItems: "center",
  },
  input: {
    flex: 1,
    borderColor: "#aaa",
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
  },
  todoItem: {
    paddingVertical: 10,
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  deleteText: {
    color: "red",
  },
});
