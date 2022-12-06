# Google Cloud Function

> Assumption: You have gcloud-cli installed in your machine

### Start the function locally

npm start

## Sample Data to test

curl -X POST http://localhost:8080 -H "Content-Type:application/json"  -d '{"cases":[{"attributes":{"type":"CaseComment","url":"/services/data/v56.0/sobjects/CaseComment/00a8G000001ENDwQAO"},"ParentId":"5008G000003vNQQQA2","CommentBody":"I am disapointed.","Id":"00a8G000001ENDwQAO"}],"action":"create"}'

## Note:

Please use node v^16.0 or v^18.0