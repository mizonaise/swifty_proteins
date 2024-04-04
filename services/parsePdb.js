import axios from "axios";
import { ToastAndroid } from "react-native";
const parser = require("parse-pdb");

export const parsePdb = async (ligand) => {
  let connectParsed;
  let result = {};
  let serials = {};
  let connectData = [];
  try {
    console.log(
      `https://files.rcsb.org/ligands/${ligand.slice(
        0,
        1
      )}/${ligand}/${ligand}_ideal.pdb`
    );
    const { data } = await axios.get(
      `https://files.rcsb.org/ligands/${ligand.slice(
        0,
        1
      )}/${ligand}/${ligand}_ideal.pdb`
    );

    const parsed = parser(data);
    connectParsed = data.split("\n");
    connectParsed = connectParsed.filter((element) =>
      element.includes("CONECT")
    );
    connectParsed.map((element, key) => {
      connectData[key] = element.split(" ").slice(1);
      connectData[key] = connectData[key].filter((item) => item != "");
    });

    parsed.atoms.forEach((element) => {
      serials[element.serial] = { x: element.x, y: element.y, z: element.z };
    });
    result = { atoms: parsed.atoms, serials, connectData };
  } catch (error) {
    console.log(error);
    ToastAndroid.show("Error Get PDB Data!", ToastAndroid.SHORT);
  }
  console.log(result);
  return result;
};
