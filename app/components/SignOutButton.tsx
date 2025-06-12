import { useClerk } from "@clerk/clerk-expo";
import * as Linking from "expo-linking";
import { LogOut } from "lucide-react-native";
import { StyleSheet, TouchableOpacity, View } from "react-native";

const SignOutButton = () => {
  // Use `useClerk()` to access the `signOut()` function
  const { signOut } = useClerk();
  const handleSignOut = async () => {
    try {
      await signOut();
      // Redirect to your desired page
      Linking.openURL(Linking.createURL("/"));
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2));
    }
  };
  return (
    <View>
      <TouchableOpacity onPress={handleSignOut} style={style.signOutContainer}>
        <LogOut size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const style = StyleSheet.create({
  signOutContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4FACFE",
    padding: 10,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    gap: 10,
  },
});

export default SignOutButton;
