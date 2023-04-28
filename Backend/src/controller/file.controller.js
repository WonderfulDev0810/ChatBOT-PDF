const { OpenAIEmbeddings } = require("langchain/embeddings/openai");
const { PineconeStore } = require("langchain/vectorstores/pinecone");
const { PDFLoader } = require("langchain/document_loaders");
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
const { PineconeClient } = require("@pinecone-database/pinecone");
const uploadFile = require("../middleware/upload");
const fs = require("fs");
const baseUrl = "http://localhost:8080/files/";
const path = require("path");

const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_ENVIRONMENT = process.env.PINECONE_ENVIRONMENT;
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME;
const PINECONE_NAME_SPACE = process.env.PINECONE_NAME_SPACE;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const upload = async (req, res) => {
  deleteFiles();
  try {
    await uploadFile(req, res);

    if (req.file == undefined) {
      return res.status(400).send({ message: "Please upload a file!" });
    }

    res.status(200).send({
      message: "Uploaded the file successfully: " + req.file.originalname,
    });
  } catch (err) {
    console.log(err);

    if (err.code == "LIMIT_FILE_SIZE") {
      return res.status(500).send({
        message: "File size cannot be larger than 2MB!",
      });
    }

    res.status(500).send({
      message: `Could not upload the file.`,
    });
  }
};

const getListFiles = (req, res) => {
  const directoryPath = __basedir + "/resources/static/assets/uploads/";

  fs.readdir(directoryPath, function (err, files) {
    if (err) {
      res.status(500).send({
        message: "Unable to scan files!",
      });
    }

    let fileInfos = [];

    files.forEach((file) => {
      fileInfos.push({
        name: file,
        url: baseUrl + file,
      });
    });

    res.status(200).send(fileInfos);
  });
};

const download = (req, res) => {
  const fileName = req.params.name;
  const directoryPath = __basedir + "/resources/static/assets/uploads/";

  res.download(directoryPath + fileName, fileName, (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not download the file. " + err,
      });
    }
  });
};

const remove = (req, res) => {
  const fileName = req.params.name;
  const directoryPath = __basedir + "/resources/static/assets/uploads/";

  fs.unlink(directoryPath + fileName, (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not delete the file. " + err,
      });
    }

    res.status(200).send({
      message: "File is deleted.",
    });
  });
};

const removeSync = (req, res) => {
  const fileName = req.params.name;
  const directoryPath = __basedir + "/resources/static/assets/uploads/";

  try {
    fs.unlinkSync(directoryPath + fileName);

    res.status(200).send({
      message: "File is deleted.",
    });
  } catch (err) {
    res.status(500).send({
      message: "Could not delete the file. " + err,
    });
  }
};

const deleteFiles = () => {
  const directoryPath = __basedir + "/resources/static/assets/uploads/1.pdf";
  fs.unlink(directoryPath, (err) => {});
};

const train = async (req, res) => {
  const { filePath } = req.body;
  try {
    /*load raw docs from the all files in the directory */
    const file = __basedir + "/resources/static/assets/uploads/1.pdf";
    const directoryLoader = new PDFLoader(file);

    const rawDocs = await directoryLoader.load();

    /* Split text into chunks */
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const docs = await textSplitter.splitDocuments(rawDocs);
    console.log("split docs", docs);

    console.log("creating vector store...");
    const pinecone = new PineconeClient();
    await pinecone.init({
      environment: "us-east-1-aws" ?? "",
      apiKey: "a87410d4-dab2-453f-b50c-0d998a254dae" ?? "",
    });
    /*create and store the embeddings in the vectorStore*/
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: "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",
    });
    const index = pinecone.Index("myindex"); //change to your own index name
    // embed the PDF documents

    await index.delete1({ deleteAll: true, namespace: "pdf-analyze" });
    await PineconeStore.fromDocuments(docs, embeddings, {
      pineconeIndex: index,
      namespace: "pdf-analyze",
      textKey: "text",
    });
    res.status(200).json("successful");
  } catch (error) {
    console.log("error", error);
    throw new Error("Failed to ingest your data");
  }
};

const newIndex = async (req, res) => {
  const client = new PineconeClient();
  await client.init({
    apiKey: "a87410d4-dab2-453f-b50c-0d998a254dae",
    environment: "us-east-1-aws",
  });
  const list = await client.createIndex({
    createRequest: {
      name: "myindex",
      dimension: 1536,
    },
  });
  await res.status(200).json("successful");
};

module.exports = {
  upload,
  getListFiles,
  download,
  train,
  remove,
  removeSync,
  newIndex,
};
