import React, { useRef, useState, useEffect } from "react";
import { router, useLocalSearchParams } from "expo-router";

import {
  Mesh,
  Scene,
  Vector3,
  SphereGeometry,
  CylinderGeometry,
  PerspectiveCamera,
  MeshMatcapMaterial,
} from "three";

import { GLView } from "expo-gl";
import ExpoTHREE, { Renderer } from "expo-three";

import cpkData from "@/data/data.json";

import { View } from "@/components/Themed";
import { parsePdb } from "@/services/parsePdb";
import useIsPortrait from "@/hooks/useIsPortrait";
import OrbitControlsView from "@/components/legend/OrbitControlsView";
import { ToastAndroid, TouchableOpacity, useColorScheme } from "react-native";
import {
  AntDesign,
  FontAwesome,
  MaterialCommunityIcons,
} from "@expo/vector-icons";

import * as Sharing from "expo-sharing";
import * as MediaLibrary from "expo-media-library";
import ViewShot, { captureRef } from "react-native-view-shot";
import Loading from "@/components/Loding";

const Legend = () => {
  const params = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const { query } = params;

  const [data, setData] = useState();

  const [start, setStart] = useState();
  const [geomet, setGeometry] = useState();
  const [objects, setObjects] = useState([]);
  const [isSphere, setIsSphere] = useState(true);
  const [aspectRatio, setAspectratop] = useState([]);

  const portrait = useIsPortrait();
  const orbitRef = useRef();
  const glViewRef = useRef();
  const cameraRef = useRef();

  const shotRef = useRef();
  const shareRef = useRef(false);

  const getData = async () => {
    let res = await parsePdb(query);
    setData(res);
  };

  const handleZoomIn = () => {
    if (cameraRef) {
      if (orbitRef.current) {
        const controls = orbitRef.current;
        controls.getControls().dollyOut(0.95 ** 1.0);
        controls.getControls().update();
      }
    }
  };

  const handleZoomOut = () => {
    if (cameraRef) {
      if (orbitRef.current) {
        const controls = orbitRef.current;
        controls.getControls().dollyIn(0.95 ** 1.0);
        controls.getControls().update();
      }
    }
  };

  const shareOrSave = async (value) => {
    shotRef.current.capture().then(async (uri) => {
      if (value === "save") {
        await MediaLibrary.saveToLibraryAsync(uri)
          .then((res) => {
            ToastAndroid.show("Saved!", ToastAndroid.SHORT);
          })
          .catch((err) => {
            console.log("Error save image:", error);
            ToastAndroid.show("Not Saved!", ToastAndroid.SHORT);
          });
      }
      if (value === "share") {
        shareRef.current = true;

        try {
          await Sharing.shareAsync(uri, {
            dialogTitle: "Title",
          })
            .then(() => (shareRef.current = false))
            .catch((err) => (shareRef.current = false));
        } catch (error) {
          shareRef.current = false;
          console.log("Error sharing image:", error);
          ToastAndroid.show("Error sharing image", ToastAndroid.SHORT);
        }
      }
    });
  };

  const intersect = ({ nativeEvent }) => {
    const { locationX: x, locationY: y } = nativeEvent;
    const mouse3D = new THREE.Vector3(
      (x / aspectRatio.width) * 2 - 1,
      -(y / aspectRatio.height) * 2 + 1,
      0.5
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse3D, cameraRef.current);

    const intersects = raycaster.intersectObjects(objects);

    if (intersects.length > 0) {
      if (intersects[0].object.name) {
        router.push({
          pathname: "/modal",
          params: { data: intersects[0].object.name },
        });
      }
    }
  };

  useEffect(() => {
    if (isSphere) setGeometry(new SphereGeometry(0.3, 32, 32));
    else setGeometry(new THREE.BoxGeometry(0.3, 0.3, 0.3));
  }, [isSphere, portrait]);

  const onContextCreate = async (gl) => {
    // three.js implementation.
    const scene = new Scene();
    scene.background = new THREE.Color(0xffffff);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 10, 0); // position above the scene
    directionalLight.target.position.set(0, 0, 0);
    scene.add(directionalLight);
    cameraRef.current = new PerspectiveCamera(
      50,
      gl.drawingBufferWidth / gl.drawingBufferHeight,
      0.1,
      1000
    );

    cameraRef.current.position.z = 30;
    gl.canvas = {
      width: gl.drawingBufferWidth,
      height: gl.drawingBufferHeight,
    };
    const renderer = new Renderer({ gl });
    renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);

    const render = () => {
      requestAnimationFrame(render);
      renderer.render(scene, cameraRef.current);
      gl.endFrameEXP();
    };

    if (data) {
      const bondMaterial = new MeshMatcapMaterial({
        // color: "green",
      });
      const atoms = [];
      const bonds = [];
      data.atoms.forEach((atom) => {
        const dataatom = cpkData[atom.element.toUpperCase()];
        const atomMaterial = new MeshMatcapMaterial({
          color: `#${dataatom?.Jmol || "FFF"}`,
        });
        // const geometry = geomet;
        // const geometry = new SphereGeometry(0.3, 32, 32);
        const mesh = new Mesh(geomet, atomMaterial);
        mesh.position.set(atom.x, atom.y, atom.z);
        mesh.name = JSON.stringify({
          name: dataatom.name,
          element: atom.element,
          discoverdBy: dataatom.discoverd_by,
          phase: dataatom.phase,
        });
        scene.add(mesh);
        setObjects((prev) => [...prev, mesh]);
        atoms.push(mesh);
      });
      data.connectData.forEach((bond, index) => {
        bond.forEach((item, key, arr) => {
          if (key === 0) return;
          const startAtom = data.serials[arr[0]];
          const endAtom = data.serials[item];
          const distance = Math.sqrt(
            (endAtom.x - startAtom.x) ** 2 +
              (endAtom.y - startAtom.y) ** 2 +
              (endAtom.z - startAtom.z) ** 2
          );
          const geometry = new CylinderGeometry(0.1, 0.1, distance, 32);
          geometry.translate(0, distance / 2, 0);
          geometry.rotateX(Math.PI / 2);
          const mesh = new Mesh(geometry, bondMaterial);

          mesh.position.set(startAtom.x, startAtom.y, startAtom.z);
          mesh.lookAt(new Vector3(endAtom.x, endAtom.y, endAtom.z));
          scene.add(mesh);
          setObjects((prev) => [...prev, mesh]);
          bonds.push(mesh);
        });
      });
    }
    render();
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <View style={{ display: "flex", flex: 1 }}>
      {data ? (
        <View style={{ display: "flex", flexDirection: "row", flex: 1 }}>
          <OrbitControlsView
            key={[isSphere, portrait]}
            ref={orbitRef}
            style={{ flex: 1 }}
            camera={cameraRef.current}
            enableZoom={true}
            onTouchStart={(event) => {
              const { locationX: x, locationY: y } = event.nativeEvent;
              setStart({ x, y });
            }}
            onTouchEndCapture={(event) => {
              const { locationX: x, locationY: y } = event.nativeEvent;
              if (x == start.x && y == start.y) intersect(event);
            }}
            onLayout={(event) => {
              var { width, height } = event.nativeEvent.layout;
              setAspectratop({
                width: width,
                height: height,
              });
            }}
          >
            <ViewShot
              ref={shotRef}
              options={{ format: "jpg", quality: 0.9 }}
              style={{
                flex: 1,
              }}
            >
              <GLView
                ref={glViewRef}
                style={{ flex: 1 }}
                onContextCreate={onContextCreate}
              />
            </ViewShot>
          </OrbitControlsView>
          <View
            style={{
              display: "flex",
              position: "absolute",
              top: 10,
              right: 10,
              zIndex: 100,
              padding: 6,
              borderRadius: 6,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
            lightColor="rgba(0,0,0,0.1)"
          >
            <TouchableOpacity
              style={{
                marginHorizontal: 6,
              }}
              onPress={() => shareOrSave("save")}
            >
              <FontAwesome
                name="save"
                size={24}
                color={colorScheme === "dark" ? "white" : "black"}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                marginHorizontal: 6,
              }}
              onPress={() => shareOrSave("share")}
            >
              <FontAwesome
                name="share-square"
                size={24}
                color={colorScheme === "dark" ? "white" : "black"}
              />
            </TouchableOpacity>
          </View>

          <View
            style={{
              borderRadius: 6,
              display: "flex",
              position: "absolute",
              right: 10,
              bottom: 10,
              zIndex: 100,
              padding: 6,
              alignItems: "center",
            }}
            lightColor="rgba(0,0,0,0.1)"
          >
            <TouchableOpacity
              style={{
                marginVertical: 4,
              }}
              onPress={handleZoomIn}
            >
              <FontAwesome
                name="plus-circle"
                size={24}
                color={colorScheme === "dark" ? "white" : "black"}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                marginVertical: 4,
              }}
              onPress={handleZoomOut}
            >
              <FontAwesome
                name="minus-circle"
                size={24}
                color={colorScheme === "dark" ? "white" : "black"}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                marginVertical: 4,
              }}
              onPress={() => setIsSphere(!isSphere)}
            >
              {isSphere ? (
                <MaterialCommunityIcons
                  name="cube"
                  size={24}
                  color={colorScheme === "dark" ? "white" : "black"}
                />
              ) : (
                <MaterialCommunityIcons
                  name="sphere"
                  size={24}
                  color={colorScheme === "dark" ? "white" : "black"}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <Loading />
      )}
    </View>
  );
};

export default Legend;
