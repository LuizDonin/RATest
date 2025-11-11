# 🔧 Guia de Solução de Problemas - AR Monorepo

## Problemas Comuns e Soluções

### 1. Erro "Status: Erro" na Aplicação

**Problema:** A aplicação mostra "Status: Erro" mesmo após clicar em "Iniciar RA"

**Soluções:**

#### A. WebXR não suportado
- **Causa:** Seu dispositivo/navegador não suporta WebXR
- **Solução:** A aplicação agora tem um "Modo Demonstração" que funciona mesmo sem WebXR
- **Como usar:** Clique em "Iniciar RA" - a aplicação entrará em modo de demonstração

#### B. Navegador não compatível
- **Navegadores suportados:** Chrome, Firefox, Safari (versões recentes)
- **Recomendação:** Use Chrome ou Firefox atualizado

#### C. HTTPS necessário
- **Problema:** WebXR requer HTTPS em produção
- **Solução:** Para desenvolvimento local, use `http://localhost:3001`
- **Para produção:** Configure HTTPS no seu servidor

### 2. Erro "vite: not found"

**Problema:** `sh: 1: vite: not found`

**Solução:**
```bash
cd apps/exemplo-ar
npm install
npm run dev
```

### 3. Erro "workspace:*" não suportado

**Problema:** `Unsupported URL Type "workspace:"`

**Solução:**
- Remova as dependências de workspace do `package.json`
- Use apenas as dependências necessárias:
```json
{
  "dependencies": {
    "three": "^0.158.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}
```

### 4. Objetos 3D não aparecem

**Problema:** Os objetos 3D não são renderizados

**Soluções:**
- Verifique se o WebGL está habilitado no navegador
- Abra o console do navegador (F12) para ver erros
- Certifique-se de que a cena foi inicializada corretamente

### 5. Performance lenta

**Problema:** A aplicação está lenta ou travando

**Soluções:**
- Reduza o número de objetos 3D na cena
- Use objetos mais simples (menos polígonos)
- Verifique se há outros processos consumindo recursos

## 🔍 Debugging

### Console do Navegador
1. Abra o navegador
2. Pressione F12 para abrir as ferramentas de desenvolvedor
3. Vá para a aba "Console"
4. Procure por mensagens de erro ou avisos

### Logs Úteis
A aplicação agora inclui logs detalhados:
- `WebXR suportado: true/false`
- `Iniciando RA...`
- `Modo de demonstração ativado`
- `RA iniciada com sucesso`

## 📱 Testando em Dispositivos Móveis

### Android
- Use Chrome ou Firefox
- Certifique-se de que o dispositivo suporta ARCore
- Permita acesso à câmera quando solicitado

### iOS
- Use Safari
- Certifique-se de que o dispositivo suporta ARKit
- Permita acesso à câmera quando solicitado

## 🛠️ Desenvolvimento

### Modo de Demonstração
Para desenvolvimento sem WebXR:
1. A aplicação detecta automaticamente se WebXR está disponível
2. Se não estiver disponível, ativa o "Modo Demonstração"
3. Você pode testar todas as funcionalidades 3D normalmente

### Adicionando Novos Objetos
```typescript
// No componente ARScene
const newObject = sceneManager.addObject('cube', '#ff0000')
```

### Personalizando a Cena
```typescript
// No ARSceneManager
private addExampleObjects(): void {
  // Adicione seus objetos aqui
  const cube = ARUtils.createCube(1, '#00ff00')
  cube.position.set(0, 0, -3)
  this.scene.add(cube)
}
```

## 🚀 Próximos Passos

1. **Implementar WebXR real:** Adicione suporte completo ao WebXR
2. **Otimizar performance:** Implemente LOD (Level of Detail)
3. **Adicionar interações:** Implemente gestos e toques
4. **Melhorar UI:** Adicione mais controles e opções

## 📞 Suporte

Se você encontrar problemas não listados aqui:
1. Verifique o console do navegador
2. Consulte a documentação do Three.js
3. Verifique a documentação do WebXR
4. Abra uma issue no repositório
