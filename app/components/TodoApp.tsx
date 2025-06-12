import { useUser } from "@clerk/clerk-expo";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  BriefcaseBusiness,
  CalendarCheck,
  Clock3,
  Menu,
  Pencil,
  Plus,
  Search,
  ShoppingBag,
  Trash2,
  UserRound,
} from "lucide-react-native";
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
import Toast from "react-native-toast-message";
import { supabase } from "../lib/supabase";
import SignOutButton from "./SignOutButton";
import TodoDetail from "./TodoDetail";

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
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // open todo detail
  const openTodoDetail = (todo: Todo) => {
    setSelectedTodo(todo);
    setShowDetailModal(true);
  };

  const closeTodoDetail = () => {
    setShowDetailModal(false);
    setSelectedTodo(null);
  };

  const handleTodoUpdate = async (updatedTodo: Todo) => {
    try {
      const todoData = {
        title: updatedTodo.title,
        description: updatedTodo.description || null,
        due_date: updatedTodo.due_date,
        due_time: updatedTodo.due_time,
        category: updatedTodo.category,
      };

      const { data, error } = await supabase
        .from("todos")
        .update(todoData)
        .eq("id", updatedTodo.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating todo:", error);
        Alert.alert("Error updating todo", error.message);
      } else {
        setTodos(
          todos.map((todo) =>
            todo.id === updatedTodo.id ? (data as Todo) : todo
          )
        );
        Alert.alert("Success", "Todo updated successfully!");
      }
    } catch (err) {
      console.error("Unexpected error updating todo:", err);
      Alert.alert("Error", "Failed to update todo");
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchTodos();
    }
  }, [user]);

  // Filter todos based on search query
  const filterTodos = (todoList: Todo[]) => {
    if (!searchQuery.trim()) {
      return todoList;
    }

    const query = searchQuery.toLowerCase().trim();
    return todoList.filter(
      (todo) =>
        todo.title.toLowerCase().includes(query) ||
        (todo.description && todo.description.toLowerCase().includes(query)) ||
        todo.category.toLowerCase().includes(query)
    );
  };

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
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to fetch todos:" + error.message,
        });
      } else {
        console.log("Fetched todos:", data);
        setTodos(data as Todo[]);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "An unexpected error occurred",
      });
    }
  };

  const addTodo = async () => {
    if (formData.title.trim() === "") {
      Toast.show({
        type: "error",
        text1: "Blank Title",
        text2: "Please enter a title",
      });
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
        return <BriefcaseBusiness opacity={"90%"} color={"#fff"} size={40} />;
      case "shopping":
        return <ShoppingBag opacity={"90%"} color={"#fff"} size={40} />;
      default:
        return <UserRound opacity={"90%"} color={"#fff"} size={40} />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "work":
        return ["#FFBF78", "#764ba2"];
      case "shopping":
        return ["#9BC09C", "#f5576c"];
      default:
        return ["#4facfe", "#00f2fe"];
    }
  };

  const getCategorybg = (category: string) => {
    switch (category) {
      case "work":
        return ["#7B4019", "#764ba2"];
      case "shopping":
        return ["#CD5656", "#f5576c"];
      default:
        return ["#819A91", "#00f2fe"];
    }
  };

  // Apply search filter to todos
  const filteredTodos = filterTodos(todos);
  const completedTodos = filteredTodos.filter((todo) => todo.completed);
  const pendingTodos = filteredTodos.filter((todo) => !todo.completed);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.todoList} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity style={styles.menuButton}>
              <Menu color={"#fff"} opacity={"90%"} />
            </TouchableOpacity>
            <SignOutButton />
          </View>

          <Text style={styles.date}>
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </Text>
          <Text style={styles.greeting}>
            Hi, {user?.emailAddresses[0].emailAddress}
          </Text>
          <Text style={styles.subtitle}>Be productive today</Text>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Search color={"#fff"} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search task"
              placeholderTextColor="rgba(255,255,255,0.6)"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Text style={{ color: "#fff", fontSize: 20 }}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Task Progress Card - Show only when not searching */}
        {!searchQuery.trim() && (
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Task Progress</Text>
              <Text style={styles.progressPercentage}>
                {Math.round(
                  (todos.filter((t) => t.completed).length /
                    Math.max(todos.length, 1)) *
                    100
                )}
                %
              </Text>
            </View>
            <Text style={styles.progressSubtitle}>
              {todos.filter((t) => t.completed).length}/{todos.length} task done
            </Text>
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${
                      (todos.filter((t) => t.completed).length /
                        Math.max(todos.length, 1)) *
                      100
                    }%`,
                  },
                ]}
              />
            </View>
            <View style={styles.progressFooter}>
              <Text style={styles.progressDate}>
                {new Date().toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </Text>
              <Text style={styles.progressStatus}>In progress</Text>
            </View>
          </View>
        )}

        {/* Todo List */}

        {/* Today's Tasks Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {searchQuery.trim() ? `Search Results` : "Today's task"}
          </Text>
          <Text style={styles.sectionCount}>
            {searchQuery.trim()
              ? `${filteredTodos.length} found`
              : `${pendingTodos.length} tasks`}
          </Text>
        </View>

        {/* Show message when searching but no results */}
        {searchQuery.trim() && filteredTodos.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No tasks found</Text>
            <Text style={styles.emptyStateSubtext}>
              Try searching with different keywords
            </Text>
          </View>
        ) : pendingTodos.length === 0 &&
          completedTodos.length === 0 &&
          !searchQuery.trim() ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No todos yet!</Text>
            <Text style={styles.emptyStateSubtext}>
              Tap Add New Task to get started
            </Text>
          </View>
        ) : (
          <>
            {/* Pending Todos */}
            {pendingTodos.map((todo, index) => (
              <TouchableOpacity
                key={todo.id}
                style={[
                  styles.todoCard,
                  {
                    backgroundColor: getCategorybg(todo.category)[0],
                  },
                ]}
                onPress={() => openTodoDetail(todo)}>
                <View style={styles.todoHeader}>
                  <View style={styles.categoryIcon}>
                    <Text style={styles.categoryEmoji}>
                      {getCategoryIcon(todo.category)}
                    </Text>
                  </View>
                  <View style={styles.todoContent}>
                    <Text style={styles.todoTitle}>{todo.title}</Text>
                    {todo.description && (
                      <Text style={styles.todoDescription} numberOfLines={2}>
                        {todo.description}
                      </Text>
                    )}
                    <View style={styles.todoMeta}>
                      <Text style={styles.todoTime}>
                        <Clock3 size={12} color={"#fff"} opacity={"82%"} />{" "}
                        {todo.due_time} -{" "}
                        {new Date(todo.due_date || "").toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric" }
                        )}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.todoActions}>
                    <TouchableOpacity
                      style={styles.checkbox}
                      onPress={() =>
                        toggleTodoComplete(todo.id, todo.completed)
                      }>
                      <View style={styles.checkboxInner} />
                    </TouchableOpacity>
                    <View style={styles.todoFooter}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => openEditModal(todo)}>
                        <Pencil color={"#B0DB9C"} width={20} />
                      </TouchableOpacity>
                    </View>
                  </View>
                  {/* Todo Detail Modal */}
                  {selectedTodo && (
                    <TodoDetail
                      todo={selectedTodo}
                      visible={showDetailModal}
                      onClose={closeTodoDetail}
                      onUpdate={handleTodoUpdate}
                      onDelete={deleteTodo}
                      onToggleComplete={toggleTodoComplete}
                    />
                  )}
                </View>
              </TouchableOpacity>
            ))}

            {/* Completed Section */}
            {completedTodos.length > 0 && (
              <View style={styles.completedSection}>
                <Text style={styles.sectionTitle}>
                  <CalendarCheck color={"#4FACFE"} />
                  Completed
                </Text>
                {completedTodos.map((todo) => (
                  <View
                    key={todo.id}
                    style={[styles.todoCard, styles.completedCard]}>
                    <View style={styles.todoHeader}>
                      <View
                        style={[
                          styles.categoryIcon,
                          { backgroundColor: "#e0e0e0" },
                        ]}>
                        <Text style={styles.categoryEmoji}>
                          {getCategoryIcon(todo.category)}
                        </Text>
                      </View>
                      <View style={styles.todoContent}>
                        <Text style={[styles.todoTitle, styles.completedText]}>
                          {todo.title}
                        </Text>
                        <Text
                          style={[
                            styles.todoDescription,
                            styles.completedText,
                          ]}>
                          {todo.due_time} {todo.due_date}
                        </Text>
                      </View>
                      <View
                        style={{
                          gap: 10,
                          alignItems: "center",
                          justifyContent: "center",
                        }}>
                        <TouchableOpacity
                          style={[styles.checkbox, styles.checkedBox]}
                          onPress={() =>
                            toggleTodoComplete(todo.id, todo.completed)
                          }>
                          <Text style={styles.checkmark}>✓</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => deleteTodo(todo.id)}>
                          <Trash2 color={"#E16A54"} width={20} />
                        </TouchableOpacity>
                      </View>
                    </View>
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
        <Plus color={"#fff"} />
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
          <Toast />

          <ScrollView style={styles.modalContent}>
            <Text style={styles.label}>Task Title</Text>
            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
              placeholder="Enter task title"
              placeholderTextColor="#999"
            />

            <Text style={styles.label}>Category</Text>
            <View style={styles.categoryContainer}>
              {[
                { key: "personal", icon: "👤", label: "Personal" },
                { key: "work", icon: "💼", label: "Work" },
                { key: "shopping", icon: "🛒", label: "Shopping" },
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
            <Text style={styles.saveButtonText}>Save Task</Text>
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
    backgroundColor: "#0A0E27",
    paddingTop: 50,
  },

  header: {
    paddingHorizontal: 14,
    paddingVertical: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    backgroundColor: "rgba(163, 163, 163, 0.07)",
    borderRadius: 20,
  },
  // Add this to your styles
  todoCardTouchable: {
    backgroundColor: "rgba(83, 83, 83, 0.08)",
    borderRadius: 20,
    marginBottom: 16,
    // Remove backgroundColor and borderRadius from todoCard style
  },

  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(134, 134, 134, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    backdropFilter: "blur(10px)",
    borderColor: "rgba(255, 255, 255, 0.2)",
  },

  menuIcon: {
    fontSize: 18,
    color: "#FFFFFF",
    fontWeight: "300",
  },

  date: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "400",
    marginBottom: 4,
  },

  greeting: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },

  subtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: 24,
    fontWeight: "300",
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 10,
    paddingHorizontal: 10,
    gap: 5,
    paddingVertical: 6,
    backdropFilter: "blur(10px)",

    borderColor: "rgba(255, 255, 255, 0.2)",
  },

  searchInput: {
    flex: 1,
    fontSize: 18,
    color: "#FFFFFF",
    fontWeight: "400",
  },

  progressCard: {
    position: "sticky",
    zIndex: 100,
    backgroundColor: "#0A0E27",
    top: 0,
    marginVertical: 15,
    paddingVertical: 24,
    paddingHorizontal: 12,
    borderBottomStartRadius: 10,
    borderBottomEndRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },

  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  progressTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#4FACFE",
  },

  progressPercentage: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  progressSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 16,
  },

  progressBarContainer: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 4,
    marginBottom: 16,
    overflow: "hidden",
  },

  progressBar: {
    height: "100%",
    backgroundColor: "#4FACFE",
    borderRadius: 4,
    shadowColor: "#FFFFFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },

  progressFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  progressDate: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    fontWeight: "500",
  },

  progressStatus: {
    width: 90,
    fontSize: 12,
    color: "#4ECDC4",
    fontWeight: "600",
    backgroundColor: "rgba(78, 205, 196, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
  },

  todoList: {
    flex: 1,
    paddingHorizontal: 24,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    marginTop: 8,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 10,
    color: "#4FACFE",
  },

  sectionCount: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.6)",
    fontWeight: "500",
  },

  todoCard: {
    backgroundColor: "rgba(83, 83, 83, 0.08)",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    backdropFilter: "blur(10px)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },

  todoHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
    display: "flex",
    alignContent: "center",
  },

  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },

  categoryEmoji: {
    fontSize: 40,
  },

  todoContent: {
    flex: 1,
    paddingRight: 12,
  },

  todoTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 6,
    lineHeight: 24,
  },

  todoDescription: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.7)",
    lineHeight: 20,
    marginBottom: 8,
  },

  todoMeta: {
    flexDirection: "row",
    alignItems: "center",
  },

  todoTime: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
    fontWeight: "500",
    alignItems: "center",
    justifyContent: "center",
  },

  todoActions: {
    justifyContent: "space-between",
    alignItems: "flex-end",
  },

  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },

  checkboxInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "transparent",
  },

  checkedBox: {
    backgroundColor: "#4ECDC4",
    borderColor: "#4ECDC4",
    shadowColor: "#4ECDC4",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },

  checkmark: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  todoFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "flex-end",
    gap: 10,
    marginTop: 18,
  },

  actionButton: {
    display: "flex",
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    backdropFilter: "blur(5px)",
  },

  actionButtonText: {
    color: "#fff",
    fontSize: 16,
  },

  completedSection: {
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },

  completedCard: {
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    opacity: 0.7,
  },

  completedText: {
    textDecorationLine: "line-through",
    opacity: 0.6,
  },

  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },

  emptyStateText: {
    fontSize: 24,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 8,
  },

  emptyStateSubtext: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.5)",
    textAlign: "center",
  },

  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4FACFE",
    margin: 24,
    paddingVertical: 13,
    borderRadius: 10,
  },

  addButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  modalContainer: {
    flex: 1,
    backgroundColor: "#0A0E27",
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingTop: 30,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },

  closeButton: {
    fontSize: 24,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "300",
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  modalContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },

  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 12,
    marginTop: 20,
  },

  input: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(10px)",
  },

  notesInput: {
    height: 120,
    textAlignVertical: "top",
    marginBottom: 20,
  },

  categoryContainer: {
    flexDirection: "row",
    gap: 12,
  },

  categoryButton: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 2,
    borderColor: "transparent",
    backdropFilter: "blur(10px)",
  },

  selectedCategory: {
    borderColor: "#4FACFE",
    backgroundColor: "rgba(79, 172, 254, 0.15)",
    shadowColor: "#4FACFE",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },

  categoryButtonIcon: {
    fontSize: 24,
    marginBottom: 8,
  },

  categoryLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.7)",
  },

  selectedCategoryLabel: {
    color: "#4FACFE",
    fontWeight: "600",
  },

  dateTimeContainer: {
    flexDirection: "row",
    gap: 12,
  },

  dateButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },

  timeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },

  dateButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "500",
  },

  timeButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "500",
  },

  dateIcon: {
    fontSize: 16,
  },

  timeIcon: {
    fontSize: 16,
  },

  saveButton: {
    backgroundColor: "#4FACFE",
    marginHorizontal: 24,
    marginBottom: 40,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#4FACFE",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },

  saveButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});

export default TodoApp;
