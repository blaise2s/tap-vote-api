// src/index.ts

import * as Express from 'express';
import * as BodyParser from 'body-parser';
import * as NoCache from 'nocache';

import { remove } from 'lodash';
import { v4 as uuid } from 'uuid';

import { Questionnaire } from './questionnaire/questionnaire';
import { QuestionType } from './question/question';

const questionnaires: Questionnaire[] = [
  {
    id: '1',
    name: 'Sample Questionnaire One',
    sections: [
      {
        name: 'Food & Drink',
        questions: [
          {
            type: QuestionType.MULTIPLE_CHOICE_SINGLE_RESPONSE,
            question: 'What state produces the most sweet potatoes?',
            options: [
              'California',
              'Idaho',
              'North Carolina',
              'Georgia',
              'Mississippi',
              'Louisiana'
            ],
            answers: ['North Carolina']
          }
        ]
      }
    ]
  },
  {
    id: '2',
    name: 'Sample Questionnaire Two',
    sections: [
      {
        name: 'Art',
        questions: [
          {
            type: QuestionType.MULTIPLE_CHOICE_MULTIPLE_RESPONSE,
            question: 'What are the three primary colors?',
            options: [
              'Red',
              'Orange',
              'Yellow',
              'Green',
              'Blue',
              'Indigo',
              'Violet'
            ],
            answers: ['Red', 'Yellow', 'Blue']
          }
        ]
      }
    ]
  }
];

const authorizedOrigins = process.env.AUTHORIZED_ORIGINS
  ? process.env.AUTHORIZED_ORIGINS.split(',')
  : [];
console.log(`Authorized origins: ${authorizedOrigins}`);

const server = Express();
server.use(BodyParser.json());
server.use(NoCache());
server.set('etag', false);
server.use((request, response, next) => {
  if (request.headers.origin) {
    const origin = request.headers.origin;
    const authorizedOrigin = authorizedOrigins.find((authorizedOrigin) => {
      return authorizedOrigin === origin;
    });
    if (authorizedOrigin) {
      response.setHeader('Access-Control-Allow-Origin', authorizedOrigin);
      response.setHeader(
        'Access-Control-Allow-Methods',
        'GET,PUT,POST,DELETE,HEAD,OPTIONS'
      );
      response.setHeader(
        'Access-Control-Allow-Headers',
        'authorization,content-type'
      );
    }
    console.log(
      `${
        authorizedOrigin ? 'Authorized' : 'Unauthorized'
      } request form origin ${origin} to resource ${request.url}`
    );
  }
  next();
});

/// Endpoints ///
server.get('/ping', (_request, response) => {
  response.send('pong');
});

server.get('/questionnaires', (_request, response) => {
  response.json(questionnaires);
});

server.get('/questionnaires/:questionnaireId', (request, response) => {
  const questionnaireId = request.params['questionnaireId'];
  const questionnaire = questionnaires.find(({ id }) => {
    return id === questionnaireId;
  });
  questionnaire ? response.json(questionnaire) : response.sendStatus(404);
});

server.post('/questionnaires', (request, response) => {
  const questionnaire: Questionnaire = request.body;
  questionnaire.id = uuid();
  questionnaires.push(questionnaire);
  response.status(201).json(questionnaire);
});

server.put('/questionnaires/:questionnaireId', (request, response) => {
  const questionnaireId = request.params['questionnaireId'];
  const questionnaireIdx = questionnaires.findIndex(({ id }) => {
    return id === questionnaireId;
  });
  if (questionnaireIdx) {
    const questionnaire: Questionnaire = request.body;
    questionnaires[questionnaireIdx] = questionnaire;
    response.sendStatus(200);
  } else {
    response.sendStatus(404);
  }
});

server.delete('/questionnaires/:questionnaireId', (request, response) => {
  const questionnaireId = request.params['questionnaireId'];
  const questionnaire = remove(questionnaires, ({ id }) => {
    return id === questionnaireId;
  });
  questionnaire.length > 0
    ? response.json(questionnaire[0])
    : response.sendStatus(404);
});
/// End Endpoints ///

const port = process.env.PORT ? +process.env.PORT : 5000;
const host = process.env.HOST;
const callbackFn = (port: number) => {
  console.log(`Tap Vote API 🚀 app started on port ${port}`);
};
console.log(`HOST: ${host ? host : 'env variable is not set'}`);
console.log(`PORT: ${port ? port : 'env variable is not set'}`);
host
  ? server.listen(port, host, () => callbackFn(port))
  : server.listen(port, () => callbackFn(port));
