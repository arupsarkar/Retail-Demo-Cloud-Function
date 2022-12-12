const tf = require("@tensorflow/tfjs");
const fetch = require("node-fetch");

exports.validateSentiment = async (req, res) => {
  let dataArray = new Array(3);
  try {
    console.log("Request Body", "Start");
    console.log(req.body);
    console.log("Request Body", "End");
    let cases = req.body.cases;
    if (cases) {
      console.log(cases);
      dataArray = await parseJSON(cases);
      console.log("Case Id", dataArray[1]);
      console.log("Case Comment Id", dataArray[0]);
      const score = await getSentiment(dataArray[2]);
      console.log("Score", score);
      res.status(200).send(`{"score": ${score}}`);
    } else {
      res.status(200).send({ error: "No cases found" });
    }
  } catch (err) {
    res
      .status(500)
      .send({ error: "Something went wrong. Please try again later." + err });
  }
};

async function parseJSON(payload) {
  let dataArray = new Array(3);
  try {
    const res = JSON.parse(JSON.stringify(payload));
    console.log(res[0].Id);
    console.log(res[0].ParentId);
    console.log(res[0].CommentBody);
    dataArray[0] = res[0].Id;
    dataArray[1] = res[0].ParentId;
    dataArray[2] = res[0].CommentBody;
  } catch (err) {
    console.error("Error parsing data ", err);
  }
  return dataArray;
}

const getMetaData = async () => {
  const metadata = await fetch(
    "https://storage.googleapis.com/tfjs-models/tfjs/sentiment_cnn_v1/metadata.json"
  );
  const results = await metadata.json();
  return results;
  //return metadata.json()
};

const padSequences = (sequences, metadata) => {
  return sequences.map((seq) => {
    if (seq.length > metadata.max_len) {
      seq.splice(0, seq.length - metadata.max_len);
    }
    if (seq.length < metadata.max_len) {
      const pad = [];
      for (let i = 0; i < metadata.max_len - seq.length; ++i) {
        pad.push(0);
      }
      seq = pad.concat(seq);
    }
    return seq;
  });
};

const loadModel = async () => {
  const url = `https://storage.googleapis.com/tfjs-models/tfjs/sentiment_cnn_v1/model.json`;
  const model = await tf.loadLayersModel(url);
  return model;
};

const predict = (text, model, metadata) => {
  const trimmed = text
    .trim()
    .toLowerCase()
    .replace(/(\.|\,|\!)/g, "")
    .split(" ");
  const sequence = trimmed.map((word) => {
    const wordIndex = metadata.word_index[word];
    if (typeof wordIndex === "undefined") {
      return 2; //oov_index
    }
    return wordIndex + metadata.index_from;
  });
  const paddedSequence = padSequences([sequence], metadata);
  const input = tf.tensor2d(paddedSequence, [1, metadata.max_len]);

  const predictOut = model.predict(input);
  const score = predictOut.dataSync()[0];
  predictOut.dispose();
  console.log("Score evaluated in predict func ", score);
  return score;
};

async function getSentiment(caseComments) {
  console.log(caseComments);
  const model = await loadModel();
  const metadata = await getMetaData();
  const score = await predict(caseComments, model, metadata);
  console.log("Score evaluated in getSentiment func ", score);
  return score;
}
