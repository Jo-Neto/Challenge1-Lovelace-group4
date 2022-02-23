## Workflow:
### por favor galera, utilizem o workflow abaixo:
1. primeiro voce tem que estar localizado **dentro** da branch que voce deseja alterar
2. criar uma **nova** branch **ANTES** de qualquer alteração
3. fazer alterações na **nova** branch
4. commitar as alterações na **nova** branch
5. dar um "push" nesta **nova** branch depois de finalizar
##### `Assim mantemos a organização e a integridade do repositório, resolvemos os conflitos em time, e sabemos das alterações dos colegas`
## Lembretes
* responsividade mobile (o kenji falou isso bem claro) (sugiro seguir o fluxo "mobile first", que é padrão na industria)
* kebab-case for HTML attributes, this-is-kebab-case
* camelCase case for Javascript, thisIsCamelCase
* english language on the code
## Socket Close Errors:


1. Erros na /Home
    1. 4100, não há players o suficiente (acontece depois de um tempo na fila)
    2. 4000, reconexão, favor redirecionar para /game
    3. 1000, partida criada, favor redirecionar para /game
2. Erros na /Game
    1. 4200, partida estava pronta, mas oponente saiu, ninguém ganhou
    2. 4008, inimigo cheatou
    3. 4004, voce não esta em nenhuma partida
    4. 4000, inimigo desconectou, vitória
    5. 1008, voce cheatou
    6. 1000, partida acabou normalmente

## Projetos Restantes
https://github.com/Jo-Neto/Challenge1-Lovelace-group4/projects