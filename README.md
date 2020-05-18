# sky-test

API RESTful de criação de sing up/sign in e controle de acesso por lista

## Recursos utilizados

  1. **NodeJS** - JavaScript runtime
  2. **MongoDB** - banco de dados nosql
  3. **bcrypt** - criptografia de senha não reversível
  4. **JWT** - token de seção
  5. **Express** - framework Node.JS
  6. **Nodemon** - reinicialização da api a cada mudança
  7. **Jest** - testes unitários e cobertura de código
  8. **ESLint** - identificação de padrões problemáticos presentes no código
  9. **Prettier** - formatação o código de modo a manter um padrão estético
  10. **Yarn** - gerenciador de pacotes
  11. **.editorconfig** - padronização de configuração de editores (IDEs)
  12. **cross-env** - definição de variáveis de ambiente independente de sistema operacional

---

## Scripts executáveis

  Para executar cada script abaixo, você precisará do [Yarn](https://yarnpkg.com/).
  Após instalá-lo, utilize `yarn <nome do script>`. Ex: `yarn start`.

  1. `start` - inicializa a api
  2. `server` - inicializa a api via `nodemon` com parâmetros de debug
  3. `server:test` - inicializa a api via `nodemon` com parâmetros de debug no bd de teste
  4. `eslint` - identifica corrige padrões problemáticos presentes no código
  5. `test` - executa os testes unitários e gera relatório de cobertura de código
  6. `migrate` - executa o comando `migrate-mongo` (necessário utilizar parâmetros)
  7. `migrate:reset` - reinicializa o banco de dados de testes via *migrations*
  8. `pretest` - executado automaticamente antes do script `test`

---

## Endpoints

### User

  1. `GET /api/user` - Obter dados básicos do usuário
  2. `POST /api/user/signup` - Registrar usuário
     1. Body
        1. `nome` - **obrigatótio** - nome do usuário
        2. `email` - **obrigatótio** - email do usuário
        3. `senha` - **obrigatótio** - senha do usuário

        Ex:

        ```json
        {
          "nome": "Fulano de Tal",
          "email": "fulanodetal@gmail.com",
          "senha": "123456"
        }
        ```

  3. `POST /api/user/signin` - Autenticar usuário e obter token
     1. Body
        1. `email` - e-mail do usuário
        2. `senha` - senha utilizada no cadastro

        Ex:

        ```json
        {
          "email": "fulanodetal@gmail.com",
          "senha": "123456"
        }
        ```

  4. `POST /api/user/signout` - Desconectar usuário
     1. Header
        1. Authorization (obrigatório, Bearer token)

            Ex:

            ```http
            Authorization: Bearer <token>
            ```

### Profile

  Todos os endpoints desta família necessitam que o token obtido no `signin` seja enviado no parâmetro `Authorization` cabeçalho, como um *Bearer token*.

  Ex:

  ```http
  Authorization: Bearer <token>
  ```

  1. `GET /api/profile/me` - Obter perfil do usuário atual
  2. `POST /api/profile` - Criar ou atualizar o perfil do usuário
     1. Body
        1. `telefones` - **obrigatório** - lista de números de telefone
           1. `numero` - número de telefone
           2. `ddd` - ddd do número de telefone
        2. `endereco` - endereço do usuário
           1. `logradouro` - nome da rua/avenida/alameda etc.
           2. `numero` - número do local
           3. `cep` - Código de Endereçamento Postal
        3. `papel` - nível de acesso
           1. `admin` ou `user`

        Ex:

        ```json
        {
          "telefones": [
            {
              "numero": "40041234",
              "ddd": "11"
            }
          ],
          "endereco": {
            "logradouro": "teste",
            "numero": 1,
            "cep": "012345-678"
          },
          "papel": "admin"
        }
        ```

  3. `GET /api/profile/all` - Obter todos os perfis - somente acessível por **admin**
  4. `GET /api/profile/user/:user_id` - Obter o perfil do usuário pelo seu id - somente acessível por **admin**
  5. `DELETE /api/profile` - Excluir perfil e respectivo usuário
