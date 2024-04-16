import { useState } from "react";
import { router } from "expo-router";
import { ResizeMode, Video } from "expo-av";
import * as DocumentPicker from "expo-document-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";

import {
  View,
  Text,
  Alert,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";

import { icons } from "../../constants";
import { createVideoPost } from "../../lib/appwrite";
import { CustomButton, FormField } from "../../components";
import { useGlobalContext } from "../../context/GlobalProvider";

const Bookmark = () => {
  const { user } = useGlobalContext();
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    audio: null,
  });
  const [result, setResult] = useState();

  const openPicker = async (selectType) => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["audio/wav"],
    });

    if (!result.canceled) {
      if (selectType === "audio") {
        setForm({
          ...form,
          audio: result.assets[0],
        });
      }
    } else {
      setTimeout(() => {
        Alert.alert("Document picked", JSON.stringify(result, null, 2));
      }, 100);
    }
  };

  // ! SUBMIT STARTS HERE
const submit = async () => {
  if (!form.audio) {
    Alert.alert("Error", "Please select an audio file");
    return;
  }

  setUploading(true);

  try {
    const formData = new FormData();
    formData.append("file", {
      uri: form.audio.uri,
      name: form.audio.name,
      type: form.audio.mimeType,
    });

    const response = await fetch("http://192.168.219.115:5000/predict", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    const result = await response.json();
    console.log(result.prediction);
    setResult(result);

    Alert.alert("Success", "Prediction completed successfully");
  } catch (error) {
    Alert.alert("Error", error.message);
    console.log(error);
  } finally {
    setUploading(false);
  }
};

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView className="px-4 my-6">
        <Text className="text-2xl text-white font-psemibold">Upload Audio</Text>

        <View className="mt-7 space-y-2">
          <Text className="text-base text-gray-100 font-pmedium">
            Upload Audio
          </Text>

          <TouchableOpacity onPress={() => openPicker("audio")}>
            {form.audio ? (
              <Video
                source={{ uri: form.audio.uri }}
                className="w-full h-64 rounded-2xl"
                useNativeControls
                isLooping
              />
            ) : (
              <View className="w-full h-40 px-4 bg-black-100 rounded-2xl border border-black-200 flex justify-center items-center">
                <View className="w-14 h-14 border border-dashed border-secondary-100 flex justify-center items-center">
                  <Image
                    source={icons.upload}
                    resizeMode="contain"
                    alt="upload"
                    className="w-1/2 h-1/2"
                  />
                </View>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {result ? (
          <View className="w-full flex-1 pt-5 pb-8 item-center">
            <Text className="text-lg font-pregular text-gray-100 mb-3">
              {result.prediction}
            </Text>
          </View>
        ) : (
          <View className="w-full flex-1 pt-5 pb-8 items-center mt-5">
            <Text className="text-lg font-pregular text-gray-100 mb-3">
              {`Nothing for you`}
            </Text>
          </View>
        )}
        <CustomButton
          title="Submit"
          handlePress={submit}
          containerStyles="mt-7"
          isLoading={uploading}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Bookmark;
