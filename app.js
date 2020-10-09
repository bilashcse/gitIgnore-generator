#! /usr/bin/env node
const axios = require("axios");
const path = require("path");
const fs = require("fs");
const chalk = require("chalk");
const { AutoComplete } = require("enquirer");

const baseUrl = "https://www.gitignore.io/api";

const getOptionsLists = async () => {
  try {
    const response = await axios.get(`${baseUrl}/list`);
    let rawList = response.data;
    rawList = rawList.replace(/(\r\n|\n|\r)/gm, ",");
    const formattedList = rawList.split(",");
    return formattedList;
  } catch (err) {
    console.error("Getting error for option lists: ", err);
  }
};

const getGeneratedFileValue = async (value = "node") => {
  try {
    let response = await axios.get(`${baseUrl}/${value}`);
    response = response.data;
    return response;
  } catch (err) {
    console.error("Error getting file values: ", err);
  }
};

const createFile = async (filePath, contents) => {
  try {
    return new Promise((resolve, reject) => {
      console.log("== Current create Path ==", filePath);
      fs.writeFile(filePath, contents, "utf-8", function (err) {
        if (err) reject(err);
        else {
          console.log(".gitignore File created successfully");
          resolve("Done");
        }
      });
    });
  } catch (err) {
    console.error("Error: ", err);
  }
};

const overWriteFile = async (filePath, contents) => {
  try {
    return new Promise((resolve, reject) => {
      console.log("== Current overwrite Path ==", filePath);
      fs.appendFileSync(filePath, contents, "utf-8", function (err) {
        if (err) reject(err);
        else {
          console.log(".gitignore File updated successfully");
          resolve("Done");
        }
      });
    });
  } catch (err) {
    console.error("Error: ", err);
  }
};

const generateGitignoreFile = async (contents) => {
  const filePath = path.resolve(path.join(process.cwd(), ".gitignore"));
  const isExists = await fs.existsSync(filePath);
  if (isExists) {
    await overWriteFile(filePath, contents);
  } else {
    await createFile(filePath, contents);
  }
};

const initAutoCompleteForSelectOption = async (lists) => {
  const prompt = new AutoComplete({
    name: "Gitignore",
    message: "Type Operating Systems, IDEs or Programming Languages",
    limit: 5,
    initial: 1,
    choices: lists,
  });

  return new Promise((resolve, reject) => {
    prompt
      .run()
      .then((answer) => {
        console.log(chalk.blue("Selected Option: ", answer));
        resolve(answer);
      })
      .catch((err) => reject("Error: ", err));
  });
};

const initOption = async () => {
  const lists = await getOptionsLists();
  const optionValue = await initAutoCompleteForSelectOption(lists);
  return optionValue;
};

(async () => {
  const option = await initOption();
  const contents = await getGeneratedFileValue(option);
  await generateGitignoreFile(contents);
})();
