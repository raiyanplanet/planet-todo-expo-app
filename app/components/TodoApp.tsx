// app/components/TodoApp.tsx
import { useUser } from "@clerk/clerk-expo";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../lib/supabase"; // Adjust path as needed

const { width } = Dimensions.get("window");

interface Todo {
  id: string;
  title: string;
  description?: string;
  due_date?: string;
  due_time?: string;
  category: "personal" | "work" | "shopping";
  completed: boolean;
  created_at: string;
  user_id: string;
}

const TodoApp = () => {
  const { user } = useUser();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    due_date: new Date(),
    due_time: new Date(),
    category: "personal" as "personal" | "work" | "shopping",
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchTodos();
    }
  }, [user]);

  const fetchTodos = async () => {
    try {
      console.log("Fetching todos for user:", user?.id);
      const { data, error } = await supabase
        .from("todos")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching todos:", error);
        Alert.alert("Error", "Failed to fetch todos: " + error.message);
      } else {
        console.log("Fetched todos:", data);
        setTodos(data as Todo[]);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      Alert.alert("Error", "An unexpected error occurred");
    }
  };

  const addTodo = async () => {
    if (formData.title.trim() === "") {
      Alert.alert("Error", "Please enter a title");
      return;
    }

    try {
      const todoData = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        due_date: formData.due_date.toISOString().split("T")[0],
        due_time: formData.due_time.toTimeString().split(" ")[0].slice(0, 5),
        category: formData.category,
        completed: false,
        user_id: user?.id,
      };

      console.log("Adding todo:", todoData);

      const { data, error } = await supabase
        .from("todos")
        .insert(todoData)
        .select()
        .single();

      if (error) {
        console.error("Error adding todo:", error);
        Alert.alert("Error adding todo", error.message);
      } else {
        console.log("Added todo:", data);
        setTodos([data as Todo, ...todos]);
        resetForm();
        setShowAddModal(false);
        Alert.alert("Success", "Todo added successfully!");
      }
    } catch (err) {
      console.error("Unexpected error adding todo:", err);
      Alert.alert("Error", "Failed to add todo");
    }
  };

  const updateTodo = async () => {
    if (!editingTodo) return;

    try {
      const todoData = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        due_date: formData.due_date.toISOString().split("T")[0],
        due_time: formData.due_time.toTimeString().split(" ")[0].slice(0, 5),
        category: formData.category,
      };

      const { data, error } = await supabase
        .from("todos")
        .update(todoData)
        .eq("id", editingTodo.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating todo:", error);
        Alert.alert("Error updating todo", error.message);
      } else {
        setTodos(
          todos.map((todo) =>
            todo.id === editingTodo.id ? (data as Todo) : todo
          )
        );
        resetForm();
        setEditingTodo(null);
        setShowAddModal(false);
        Alert.alert("Success", "Todo updated successfully!");
      }
    } catch (err) {
      console.error("Unexpected error updating todo:", err);
      Alert.alert("Error", "Failed to update todo");
    }
  };

  const toggleTodoComplete = async (id: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from("todos")
        .update({ completed: !completed })
        .eq("id", id);

      if (error) {
        console.error("Error updating todo:", error);
        Alert.alert("Error updating todo", error.message);
      } else {
        setTodos(
          todos.map((todo) =>
            todo.id === id ? { ...todo, completed: !completed } : todo
          )
        );
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      Alert.alert("Error", "Failed to update todo");
    }
  };

  const deleteTodo = async (id: string) => {
    Alert.alert("Delete Todo", "Are you sure you want to delete this todo?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const { error } = await supabase
              .from("todos")
              .delete()
              .eq("id", id);
            if (error) {
              console.error("Error deleting todo:", error);
              Alert.alert("Error deleting todo", error.message);
            } else {
              setTodos(todos.filter((todo) => todo.id !== id));
              Alert.alert("Success", "Todo deleted successfully!");
            }
          } catch (err) {
            console.error("Unexpected error:", err);
            Alert.alert("Error", "Failed to delete todo");
          }
        },
      },
    ]);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      due_date: new Date(),
      due_time: new Date(),
      category: "personal",
    });
  };

  const openEditModal = (todo: Todo) => {
    setEditingTodo(todo);
    setFormData({
      title: todo.title,
      description: todo.description || "",
      due_date: todo.due_date ? new Date(todo.due_date) : new Date(),
      due_time: todo.due_time
        ? new Date(`2000-01-01T${todo.due_time}`)
        : new Date(),
      category: todo.category,
    });
    setShowAddModal(true);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "work":
        return "💼";
      case "shopping":
        return "🛍️";
      default:
        return "👤";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "work":
        return "#4A90E2";
      case "shopping":
        return "#F5A623";
      default:
        return "#7B68EE";
    }
  };

  const completedTodos = todos.filter((todo) => todo.completed);
  const pendingTodos = todos.filter((todo) => !todo.completed);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.date}>
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </Text>
        <Text style={styles.title}>My Todo List</Text>
      </View>

      {/* Debug Info */}
      <View style={styles.debugInfo}>
        <Text style={styles.debugText}>User ID: {user?.id}</Text>
        <Text style={styles.debugText}>Total Todos: {todos.length}</Text>
        <TouchableOpacity onPress={fetchTodos} style={styles.refreshButton}>
          <Text style={styles.refreshText}>🔄 Refresh</Text>
        </TouchableOpacity>
      </View>

      {/* Todo List */}
      <ScrollView style={styles.todoList} showsVerticalScrollIndicator={false}>
        {/* Pending Todos */}
        {pendingTodos.length === 0 && completedTodos.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No todos yet!</Text>
            <Text style={styles.emptyStateSubtext}>
              Tap "Add New Task" to get started
            </Text>
          </View>
        ) : (
          <>
            {pendingTodos.map((todo) => (
              <View key={todo.id} style={styles.todoItem}>
                <View style={styles.todoContent}>
                  <View style={styles.todoHeader}>
                    <View
                      style={[
                        styles.categoryIcon,
                        { backgroundColor: getCategoryColor(todo.category) },
                      ]}>
                      <Text style={styles.categoryEmoji}>
                        {getCategoryIcon(todo.category)}
                      </Text>
                    </View>
                    <Text style={styles.todoTitle}>{todo.title}</Text>
                    <TouchableOpacity
                      style={styles.checkbox}
                      onPress={() =>
                        toggleTodoComplete(todo.id, todo.completed)
                      }>
                      <View style={styles.checkboxInner} />
                    </TouchableOpacity>
                  </View>
                  {todo.description && (
                    <Text style={styles.todoDescription}>
                      {todo.description}
                    </Text>
                  )}
                  {todo.due_time && (
                    <Text style={styles.todoTime}>{todo.due_time}</Text>
                  )}
                </View>
                <View style={styles.todoActions}>
                  <TouchableOpacity onPress={() => openEditModal(todo)}>
                    <Text style={styles.editButton}>✏️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteTodo(todo.id)}>
                    <Text style={styles.deleteButton}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {/* Completed Section */}
            {completedTodos.length > 0 && (
              <View style={styles.completedSection}>
                <Text style={styles.sectionTitle}>Completed</Text>
                {completedTodos.map((todo) => (
                  <View
                    key={todo.id}
                    style={[styles.todoItem, styles.completedTodo]}>
                    <View style={styles.todoContent}>
                      <View style={styles.todoHeader}>
                        <View
                          style={[
                            styles.categoryIcon,
                            { backgroundColor: "#ccc" },
                          ]}>
                          <Text style={styles.categoryEmoji}>
                            {getCategoryIcon(todo.category)}
                          </Text>
                        </View>
                        <Text style={[styles.todoTitle, styles.completedText]}>
                          {todo.title}
                        </Text>
                        <TouchableOpacity
                          style={[styles.checkbox, styles.checkedBox]}
                          onPress={() =>
                            toggleTodoComplete(todo.id, todo.completed)
                          }>
                          <Text style={styles.checkmark}>✓</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    <TouchableOpacity onPress={() => deleteTodo(todo.id)}>
                      <Text style={styles.deleteButton}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Add Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          resetForm();
          setEditingTodo(null);
          setShowAddModal(true);
        }}>
        <Text style={styles.addButtonText}>Add New Task</Text>
      </TouchableOpacity>

      {/* Add/Edit Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingTodo ? "Edit Task" : "Add New Task"}
            </Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.label}>Task Title</Text>
            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
              placeholder="Pick up Milk"
              placeholderTextColor="#999"
            />

            <Text style={styles.label}>Category</Text>
            <View style={styles.categoryContainer}>
              {[
                { key: "personal", icon: "👤", label: "Personal" },
                { key: "work", icon: "💼", label: "Work" },
                { key: "shopping", icon: "🛍️", label: "Shopping" },
              ].map((cat) => (
                <TouchableOpacity
                  key={cat.key}
                  style={[
                    styles.categoryButton,
                    formData.category === cat.key && styles.selectedCategory,
                  ]}
                  onPress={() =>
                    setFormData({ ...formData, category: cat.key as any })
                  }>
                  <Text style={styles.categoryButtonIcon}>{cat.icon}</Text>
                  <Text
                    style={[
                      styles.categoryLabel,
                      formData.category === cat.key &&
                        styles.selectedCategoryLabel,
                    ]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>When</Text>
            <View style={styles.dateTimeContainer}>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}>
                <Text style={styles.dateButtonText}>
                  {formData.due_date.toLocaleDateString()}
                </Text>
                <Text style={styles.dateIcon}>📅</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => setShowTimePicker(true)}>
                <Text style={styles.timeButtonText}>
                  {formData.due_time.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
                <Text style={styles.timeIcon}>🕐</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, styles.notesInput]}
              value={formData.description}
              onChangeText={(text) =>
                setFormData({ ...formData, description: text })
              }
              placeholder="Add your notes here"
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
            />
          </ScrollView>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={editingTodo ? updateTodo : addTodo}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={formData.due_date}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  setFormData({ ...formData, due_date: selectedDate });
                }
              }}
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={formData.due_time}
              mode="time"
              display="default"
              onChange={(event, selectedTime) => {
                setShowTimePicker(false);
                if (selectedTime) {
                  setFormData({ ...formData, due_time: selectedTime });
                }
              }}
            />
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    backgroundColor: "#6B46C1",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 30,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  date: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
    marginBottom: 5,
  },
  title: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
  },
  debugInfo: {
    backgroundColor: "#E3F2FD",
    padding: 10,
    margin: 10,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  debugText: {
    fontSize: 12,
    color: "#1976D2",
  },
  refreshButton: {
    backgroundColor: "#1976D2",
    padding: 5,
    borderRadius: 5,
  },
  refreshText: {
    color: "white",
    fontSize: 12,
  },
  todoList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#666",
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#999",
  },
  todoItem: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  todoContent: {
    flex: 1,
  },
  todoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  categoryEmoji: {
    fontSize: 16,
  },
  todoTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  todoDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
    marginLeft: 44,
  },
  todoTime: {
    fontSize: 12,
    color: "#888",
    marginLeft: 44,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#DDD",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "transparent",
  },
  checkedBox: {
    backgroundColor: "#6B46C1",
    borderColor: "#6B46C1",
  },
  checkmark: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  todoActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  editButton: {
    fontSize: 18,
  },
  deleteButton: {
    fontSize: 18,
  },
  completedSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  completedTodo: {
    opacity: 0.7,
  },
  completedText: {
    textDecorationLine: "line-through",
    color: "#888",
  },
  addButton: {
    backgroundColor: "#6B46C1",
    margin: 20,
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: "center",
    shadowColor: "#6B46C1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  closeButton: {
    fontSize: 20,
    color: "#666",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
    marginTop: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#F8F9FA",
  },
  categoryContainer: {
    flexDirection: "row",
    gap: 10,
  },
  categoryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    gap: 8,
  },
  selectedCategory: {
    backgroundColor: "#6B46C1",
    borderColor: "#6B46C1",
  },
  categoryButtonIcon: {
    fontSize: 16,
  },
  categoryLabel: {
    fontSize: 14,
    color: "#666",
  },
  selectedCategoryLabel: {
    color: "white",
  },
  dateTimeContainer: {
    flexDirection: "row",
    gap: 10,
  },
  dateButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  dateButtonText: {
    fontSize: 16,
    color: "#333",
  },
  dateIcon: {
    fontSize: 16,
  },
  timeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    minWidth: 100,
  },
  timeButtonText: {
    fontSize: 16,
    color: "#333",
  },
  timeIcon: {
    fontSize: 16,
  },
  notesInput: {
    height: 100,
    textAlignVertical: "top",
  },
  saveButton: {
    backgroundColor: "#6B46C1",
    margin: 20,
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: "center",
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default TodoApp;
