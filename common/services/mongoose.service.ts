import mongoose from "mongoose";
import debug from "debug";

const log: debug.IDebugger = debug("app:mongoose-service");

class MongooseService {
  private count = 0;
  private mongooseOptions = {
    // Sem isso definido como true, o Mongoose imprime um aviso de descontinuação.
    useNewUrlParser: true,
    // A documentação do Mongoose recomenda definir isso para usar um mecanismo de gerenciamento de conexão mais recente.
    useUnifiedTopology: true,
    // Para o propósito do UX deste projeto de demonstração, um tempo menor que o padrão de 30 segundos significa que qualquer leitor que se esqueça de iniciar o MongoDB antes do Node.js verá um feedback útil sobre ele mais cedo, em vez de um back-end aparentemente sem resposta
    serverSelectionTimeoutMS: 5000,
    // isso faz com que o Mongoose use um recurso nativo mais recente do MongoDB em vez de um shim do Mongoose mais antigo.
    useFindAndModify: false,
  };

  constructor() {
    this.connectWithRetry();
  }

  getMongoose() {
    return mongoose;
  }

  connectWithRetry = () => {
    log("Attempting MongoDB connection (will retry if needed)");
    mongoose
      .connect("mongodb://localhost:27017/api-db", this.mongooseOptions)
      .then(() => {
        log("MongoDB is connected");
      })
      .catch((err) => {
        const retrySeconds = 5;
        log(
          `MongoDB connection unsuccessful (will retry #${++this
            .count} after ${retrySeconds} seconds):`,
          err
        );
        setTimeout(this.connectWithRetry, retrySeconds * 1000);
      });
    // MongooseService.connectWithRetry() tenta novamente o procedimento acima, caso nosso aplicativo seja iniciado, mas o serviço MongoDB ainda não esteja em execução.
    // connectWithRetry() será executado apenas uma vez, mas tentará novamente a connect(), com uma pausa de X segundos.
  };
}
export default new MongooseService();
