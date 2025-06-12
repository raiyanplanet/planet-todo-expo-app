import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { FormData, Todo } from "../types/todo";

interface TodoModalProps {
  visible: boolean;
  editingTodo: Todo | null;
  formData: FormData;
  onClose: () => void;
  onSave: () => void;
  onFormDataChange: (data: Partial<FormData>) => void;
}

const TodoModal: React.FC<TodoModalProps> = ({
  visible,
  editingTodo,
  formData,
  onClose,
  onSave,
  onFormDataChange,
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      onFormDataChange({ due_date: selectedDate });
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      onFormDataChange({ due_time: selectedTime });
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet">
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
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
            onChangeText={(text) => onFormDataChange({ title: text })}
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
                onPress={() => onFormDataChange({ category: cat.key as any })}>
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
            onChangeText={(text) => onFormDataChange({ description: text })}
            placeholder="Add your notes here"
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
          />
        </ScrollView>

        <TouchableOpacity style={styles.saveButton} onPress={onSave}>
          <Text style={styles.saveButtonText}>Save Task</Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={formData.due_date}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            value={formData.due_time}
            mode="time"
            display="default"
            onChange={handleTimeChange}
          />
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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

export default TodoModal;
