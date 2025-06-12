import { useUser } from "@clerk/clerk-expo";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../lib/supabase";

const { width, height } = Dimensions.get("window");

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

interface TodoDetailPageProps {
  todo: Todo;
  onClose: () => void;
  onUpdate: (updatedTodo: Todo) => void;
  onDelete: (todoId: string) => void;
}

const TodoDetailPage: React.FC<TodoDetailPageProps> = ({
  todo,
  onClose,
  onUpdate,
  onDelete,
}) => {
  const { user } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [formData, setFormData] = useState({
    title: todo.title,
    description: todo.description || "",
    due_date: todo.due_date ? new Date(todo.due_date) : new Date(),
    due_time: todo.due_time
      ? new Date(`2000-01-01T${todo.due_time}`)
      : new Date(),
    category: todo.category,
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "work":
        return "💼";
      case "shopping":
        return "🛒";
      default:
        return "👤";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "work":
        return ["#667eea", "#764ba2"];
      case "shopping":
        return ["#f093fb", "#f5576c"];
      default:
        return ["#4facfe", "#00f2fe"];
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case "work":
        return "Work";
      case "shopping":
        return "Shopping";
      default:
        return "Personal";
    }
  };

  const toggleTodoComplete = async () => {
    try {
      const { error } = await supabase
        .from("todos")
        .update({ completed: !todo.completed })
        .eq("id", todo.id);

      if (error) {
        console.error("Error updating todo:", error);
        Alert.alert("Error updating todo", error.message);
      } else {
        onUpdate({ ...todo, completed: !todo.completed });
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      Alert.alert("Error", "Failed to update todo");
    }
  };

  const updateTodo = async () => {
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
        .eq("id", todo.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating todo:", error);
        Alert.alert("Error updating todo", error.message);
      } else {
        onUpdate(data as Todo);
        setIsEditing(false);
        Alert.alert("Success", "Todo updated successfully!");
      }
    } catch (err) {
      console.error("Unexpected error updating todo:", err);
      Alert.alert("Error", "Failed to update todo");
    }
  };

  const deleteTodo = async () => {
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
              .eq("id", todo.id);
            if (error) {
              console.error("Error deleting todo:", error);
              Alert.alert("Error deleting todo", error.message);
            } else {
              onDelete(todo.id);
              onClose();
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

  const cancelEdit = () => {
    setFormData({
      title: todo.title,
      description: todo.description || "",
      due_date: todo.due_date ? new Date(todo.due_date) : new Date(),
      due_time: todo.due_time
        ? new Date(`2000-01-01T${todo.due_time}`)
        : new Date(),
      category: todo.category,
    });
    setIsEditing(false);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "No date set";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return "No time set";
    const [hours, minutes] = timeString.split(":");
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTimeUntilDue = () => {
    if (!todo.due_date || !todo.due_time) return null;

    const dueDateTime = new Date(`${todo.due_date}T${todo.due_time}`);
    const now = new Date();
    const diffMs = dueDateTime.getTime() - now.getTime();

    if (diffMs < 0) {
      const pastDays = Math.floor(Math.abs(diffMs) / (1000 * 60 * 60 * 24));
      if (pastDays === 0) return "Overdue (today)";
      return `Overdue by ${pastDays} day${pastDays > 1 ? "s" : ""}`;
    }

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );

    if (days === 0) {
      if (hours === 0) return "Due soon";
      return `Due in ${hours} hour${hours > 1 ? "s" : ""}`;
    }
    return `Due in ${days} day${days > 1 ? "s" : ""}`;
  };

  const timeUntilDue = getTimeUntilDue();
  const isOverdue = timeUntilDue?.includes("Overdue");

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onClose}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Task Details</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => setIsEditing(!isEditing)}>
          <Text style={styles.editIcon}>{isEditing ? "✕" : "✏️"}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Banner */}
        <View
          style={[
            styles.statusBanner,
            todo.completed
              ? styles.completedBanner
              : isOverdue
              ? styles.overdueBanner
              : styles.pendingBanner,
          ]}>
          <Text style={styles.statusText}>
            {todo.completed
              ? "✓ Completed"
              : isOverdue
              ? "⚠️ Overdue"
              : "📋 In Progress"}
          </Text>
          {!todo.completed && timeUntilDue && (
            <Text style={styles.timeUntilText}>{timeUntilDue}</Text>
          )}
        </View>

        {/* Main Content Card */}
        <View style={styles.mainCard}>
          {/* Category Section */}
          <View style={styles.categorySection}>
            <View
              style={[
                styles.categoryIconLarge,
                { backgroundColor: getCategoryColor(todo.category)[0] },
              ]}>
              <Text style={styles.categoryEmojiLarge}>
                {getCategoryIcon(todo.category)}
              </Text>
            </View>
            <View style={styles.categoryInfo}>
              <Text style={styles.categoryLabel}>Category</Text>
              {isEditing ? (
                <View style={styles.categoryEditContainer}>
                  {[
                    { key: "personal", icon: "👤", label: "Personal" },
                    { key: "work", icon: "💼", label: "Work" },
                    { key: "shopping", icon: "🛒", label: "Shopping" },
                  ].map((cat) => (
                    <TouchableOpacity
                      key={cat.key}
                      style={[
                        styles.categoryEditButton,
                        formData.category === cat.key &&
                          styles.selectedCategoryEdit,
                      ]}
                      onPress={() =>
                        setFormData({ ...formData, category: cat.key as any })
                      }>
                      <Text style={styles.categoryEditIcon}>{cat.icon}</Text>
                      <Text
                        style={[
                          styles.categoryEditLabel,
                          formData.category === cat.key &&
                            styles.selectedCategoryEditLabel,
                        ]}>
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <Text style={styles.categoryName}>
                  {getCategoryName(todo.category)}
                </Text>
              )}
            </View>
          </View>

          {/* Title Section */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Title</Text>
            {isEditing ? (
              <TextInput
                style={styles.titleInput}
                value={formData.title}
                onChangeText={(text) =>
                  setFormData({ ...formData, title: text })
                }
                placeholder="Enter task title"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                multiline
              />
            ) : (
              <Text
                style={[styles.title, todo.completed && styles.completedText]}>
                {todo.title}
              </Text>
            )}
          </View>

          {/* Description Section */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Description</Text>
            {isEditing ? (
              <TextInput
                style={styles.descriptionInput}
                value={formData.description}
                onChangeText={(text) =>
                  setFormData({ ...formData, description: text })
                }
                placeholder="Add description..."
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                multiline
                numberOfLines={4}
              />
            ) : (
              <Text style={styles.description}>
                {todo.description || "No description added"}
              </Text>
            )}
          </View>

          {/* Date & Time Section */}
          <View style={styles.dateTimeSection}>
            <View style={styles.dateTimeItem}>
              <Text style={styles.sectionLabel}>Due Date</Text>
              {isEditing ? (
                <TouchableOpacity
                  style={styles.dateTimeEditButton}
                  onPress={() => setShowDatePicker(true)}>
                  <Text style={styles.dateTimeEditText}>
                    📅 {formData.due_date.toLocaleDateString()}
                  </Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.dateTimeText}>
                  📅 {formatDate(todo.due_date)}
                </Text>
              )}
            </View>

            <View style={styles.dateTimeItem}>
              <Text style={styles.sectionLabel}>Due Time</Text>
              {isEditing ? (
                <TouchableOpacity
                  style={styles.dateTimeEditButton}
                  onPress={() => setShowTimePicker(true)}>
                  <Text style={styles.dateTimeEditText}>
                    🕐{" "}
                    {formData.due_time.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.dateTimeText}>
                  🕐 {formatTime(todo.due_time)}
                </Text>
              )}
            </View>
          </View>

          {/* Created Date */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Created</Text>
            <Text style={styles.createdText}>
              {new Date(todo.created_at).toLocaleDateString("en-US", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        {isEditing ? (
          <View style={styles.editActions}>
            <TouchableOpacity style={styles.cancelButton} onPress={cancelEdit}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={updateTodo}>
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.mainActions}>
            <TouchableOpacity style={styles.deleteButton} onPress={deleteTodo}>
              <Text style={styles.deleteIcon}>🗑️</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.completeButton,
                todo.completed && styles.uncompleteButton,
              ]}
              onPress={toggleTodoComplete}>
              <Text style={styles.completeButtonText}>
                {todo.completed ? "Mark Incomplete" : "Mark Complete"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Date/Time Pickers */}
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0E27",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    backdropFilter: "blur(10px)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },

  backIcon: {
    fontSize: 20,
    color: "#FFFFFF",
    fontWeight: "600",
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  editButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    backdropFilter: "blur(10px)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },

  editIcon: {
    fontSize: 18,
    color: "#FFFFFF",
  },

  content: {
    flex: 1,
    paddingHorizontal: 24,
  },

  statusBanner: {
    marginTop: 20,
    marginBottom: 24,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  completedBanner: {
    backgroundColor: "rgba(78, 205, 196, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(78, 205, 196, 0.3)",
  },

  overdueBanner: {
    backgroundColor: "rgba(255, 107, 107, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(255, 107, 107, 0.3)",
  },

  pendingBanner: {
    backgroundColor: "rgba(79, 172, 254, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(79, 172, 254, 0.3)",
  },

  statusText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  timeUntilText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },

  mainCard: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 24,
    padding: 24,
    backdropFilter: "blur(10px)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 24,
  },

  categorySection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },

  categoryIconLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },

  categoryEmojiLarge: {
    fontSize: 28,
  },

  categoryInfo: {
    flex: 1,
  },

  categoryLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.6)",
    marginBottom: 4,
  },

  categoryName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  categoryEditContainer: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },

  categoryEditButton: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "transparent",
  },

  selectedCategoryEdit: {
    borderColor: "#4FACFE",
    backgroundColor: "rgba(79, 172, 254, 0.15)",
  },

  categoryEditIcon: {
    fontSize: 16,
    marginBottom: 4,
  },

  categoryEditLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.7)",
  },

  selectedCategoryEditLabel: {
    color: "#4FACFE",
  },

  section: {
    marginBottom: 28,
  },

  sectionLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.6)",
    marginBottom: 8,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    lineHeight: 32,
  },

  titleInput: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    textAlignVertical: "top",
  },

  description: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    lineHeight: 24,
  },

  descriptionInput: {
    fontSize: 16,
    color: "#FFFFFF",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    height: 100,
    textAlignVertical: "top",
  },

  dateTimeSection: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 28,
  },

  dateTimeItem: {
    flex: 1,
  },

  dateTimeText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "500",
  },

  dateTimeEditButton: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },

  dateTimeEditText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "500",
  },

  createdText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.6)",
  },

  completedText: {
    textDecorationLine: "line-through",
    opacity: 0.7,
  },

  actionContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },

  editActions: {
    flexDirection: "row",
    gap: 16,
  },

  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },

  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.8)",
  },

  saveButton: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    backgroundColor: "#4FACFE",
    shadowColor: "#4FACFE",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },

  saveButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  mainActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },

  deleteButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 107, 107, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 107, 107, 0.3)",
  },

  deleteIcon: {
    fontSize: 24,
  },

  completeButton: {
    flex: 1,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    backgroundColor: "#4ECDC4",
    shadowColor: "#4ECDC4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },

  uncompleteButton: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    shadowColor: "transparent",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },

  completeButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});

export default TodoDetailPage;
