const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Criar diretório de uploads se não existir
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuração do multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  }
});

const fileFilter = (req, file, cb) => {
  // Tipos de arquivo permitidos
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não permitido'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: fileFilter
});

// Simulação de banco de dados para arquivos
let files = [];
let fileIdCounter = 1;

// Upload de arquivo único
router.post('/single', auth, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'Nenhum arquivo foi enviado'
      });
    }

    const fileData = {
      id: fileIdCounter++,
      originalName: req.file.originalname,
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
      uploadedBy: req.user.id,
      uploadedAt: new Date().toISOString()
    };

    files.push(fileData);

    res.json({
      message: 'Arquivo enviado com sucesso',
      file: {
        id: fileData.id,
        originalName: fileData.originalName,
        filename: fileData.filename,
        size: fileData.size,
        mimetype: fileData.mimetype,
        uploadedAt: fileData.uploadedAt,
        url: `/api/upload/files/${fileData.filename}`
      }
    });

  } catch (error) {
    res.status(500).json({
      error: 'Erro no upload do arquivo'
    });
  }
});

// Upload de múltiplos arquivos
router.post('/multiple', auth, upload.array('files', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        error: 'Nenhum arquivo foi enviado'
      });
    }

    const uploadedFiles = req.files.map(file => {
      const fileData = {
        id: fileIdCounter++,
        originalName: file.originalname,
        filename: file.filename,
        path: file.path,
        size: file.size,
        mimetype: file.mimetype,
        uploadedBy: req.user.id,
        uploadedAt: new Date().toISOString()
      };

      files.push(fileData);

      return {
        id: fileData.id,
        originalName: fileData.originalName,
        filename: fileData.filename,
        size: fileData.size,
        mimetype: fileData.mimetype,
        uploadedAt: fileData.uploadedAt,
        url: `/api/upload/files/${fileData.filename}`
      };
    });

    res.json({
      message: `${uploadedFiles.length} arquivo(s) enviado(s) com sucesso`,
      files: uploadedFiles
    });

  } catch (error) {
    res.status(500).json({
      error: 'Erro no upload dos arquivos'
    });
  }
});

// Listar arquivos do usuário
router.get('/my-files', auth, (req, res) => {
  const userFiles = files
    .filter(file => file.uploadedBy === req.user.id)
    .map(file => ({
      id: file.id,
      originalName: file.originalName,
      filename: file.filename,
      size: file.size,
      mimetype: file.mimetype,
      uploadedAt: file.uploadedAt,
      url: `/api/upload/files/${file.filename}`
    }));

  res.json({
    files: userFiles,
    total: userFiles.length
  });
});

// Servir arquivos
router.get('/files/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, '..', uploadDir, filename);

  // Verificar se arquivo existe
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      error: 'Arquivo não encontrado'
    });
  }

  // Encontrar metadados do arquivo
  const fileData = files.find(f => f.filename === filename);
  if (!fileData) {
    return res.status(404).json({
      error: 'Arquivo não encontrado no banco de dados'
    });
  }

  // Definir headers apropriados
  res.setHeader('Content-Type', fileData.mimetype);
  res.setHeader('Content-Disposition', `inline; filename="${fileData.originalName}"`);

  // Enviar arquivo
  res.sendFile(path.resolve(filePath));
});

// Download de arquivo
router.get('/download/:filename', auth, (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, '..', uploadDir, filename);

  // Verificar se arquivo existe
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      error: 'Arquivo não encontrado'
    });
  }

  // Encontrar metadados do arquivo
  const fileData = files.find(f => f.filename === filename);
  if (!fileData) {
    return res.status(404).json({
      error: 'Arquivo não encontrado no banco de dados'
    });
  }

  // Verificar permissão (usuário só pode baixar seus próprios arquivos ou ser admin)
  if (req.user.role !== 'admin' && fileData.uploadedBy !== req.user.id) {
    return res.status(403).json({
      error: 'Acesso negado'
    });
  }

  // Forçar download
  res.setHeader('Content-Disposition', `attachment; filename="${fileData.originalName}"`);
  res.sendFile(path.resolve(filePath));
});

// Deletar arquivo
router.delete('/:id', auth, (req, res) => {
  const fileId = parseInt(req.params.id);
  const fileIndex = files.findIndex(f => f.id === fileId);

  if (fileIndex === -1) {
    return res.status(404).json({
      error: 'Arquivo não encontrado'
    });
  }

  const file = files[fileIndex];

  // Verificar permissão
  if (req.user.role !== 'admin' && file.uploadedBy !== req.user.id) {
    return res.status(403).json({
      error: 'Acesso negado'
    });
  }

  // Deletar arquivo físico
  if (fs.existsSync(file.path)) {
    fs.unlinkSync(file.path);
  }

  // Remover do array
  files.splice(fileIndex, 1);

  res.json({
    message: 'Arquivo deletado com sucesso'
  });
});

// Middleware de tratamento de erros do multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'Arquivo muito grande. Tamanho máximo: 5MB'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        error: 'Muitos arquivos. Máximo: 5 arquivos'
      });
    }
  }
  
  res.status(400).json({
    error: error.message || 'Erro no upload'
  });
});

module.exports = router;
