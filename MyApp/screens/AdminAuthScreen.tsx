import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";

const AdminAuthScreen = ({ navigation }: any) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (username === "admin" && password === "admin123") {
      navigation.navigate("UploadScreen");
    } else {
      Alert.alert("Invalid Credentials", "Please check your username or password.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Login</Text>
      <TextInput placeholder="Username" value={username} onChangeText={setUsername} style={styles.input} />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
};

export default AdminAuthScreen;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 24, marginBottom: 20, textAlign: "center" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
  },
});
