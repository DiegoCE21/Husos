'use client';

import { useState, useEffect } from 'react';
import Timer from './components/Timer'; 
import Grid from './components/Grid'; 
import { Button, Modal } from 'react-bootstrap';
import * as XLSX from 'xlsx';
import axios from 'axios';
import { useRouter } from 'next/navigation'; 
import { setCookie, getCookie } from '../../utils/cookies'; // Importar funciones de cookies

export default function Home() {
  const [isRegisterActive, setIsRegisterActive] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [showAlertModal, setShowAlertModal] = useState<boolean>(false);
  const [showInputModal, setShowInputModal] = useState<boolean>(false); 
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState<boolean>(false);
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [orderNumber, setOrderNumber] = useState<string>('');
  const [stopCount, setStopCount] = useState<string>(''); 
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [dataToConfirm, setDataToConfirm] = useState<any[]>([]);

  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Cargar datos de la cookie
    const savedOrderNumber = getCookie('orderNumber');
    const savedStyle = getCookie('selectedStyle');
    const savedStopCount = getCookie('stopCount');
    if (savedOrderNumber) setOrderNumber(savedOrderNumber);
    if (savedStyle) setSelectedStyle(savedStyle);
    if (savedStopCount) setStopCount(savedStopCount);

    // Si no existen las cookies, mostrar el modal para ingresar los datos
    if (!(savedOrderNumber && savedStyle && savedStopCount)) {
      setShowInputModal(true);
    }
  }, []);

  const handleLoginClick = () => {
    if (isClient) {
      router.push('/login');
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;

    if (isRegisterActive) {
      timer = setInterval(() => {
        setElapsedTime((prevTime) => prevTime + 1000);
      }, 1000);
    } else {
      if (timer) {
        clearInterval(timer);
      }
      setElapsedTime(0);
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [isRegisterActive]);

  const startRegistration = () => {
    if (orderNumber && selectedStyle && stopCount) {
      setIsRegisterActive(true);
      setShowInputModal(false);
    } else {
      setShowAlertModal(true);
    }
  };

  const handleInputModalSubmit = async () => {
    /*
    try {
      // Verifica si la orden ya existe en la base de datos
      const response = await axios.post('/api/order', { action: 'check', orderNumber });
  
      if (response.data.exists) {
        // La orden existe, verifica si el estilo o el número de paradas han cambiado
        const { currentStyle, currentStopCount } = response.data;
  
        if (currentStyle !== selectedStyle || currentStopCount !== stopCount) {
          // Si han cambiado, realiza el update
          await axios.post('/api/order', {
            action: 'update',
            orderNumber,
            selectedStyle,
            stopCount,
          });
        }
      } else {
        // La orden no existe, inserta la nueva orden
        await axios.post('/api/order', {
          action: 'insert',
          orderNumber,
          selectedStyle,
          stopCount,
        });
      }
  
      // Guarda en cookies
      setCookie('orderNumber', orderNumber, 7);
      setCookie('selectedStyle', selectedStyle, 7);
      setCookie('stopCount', stopCount, 7);
  
      startRegistration();
    } catch (error) {
      console.error('Error al verificar o insertar la orden:', error);
    }*/
      setCookie('orderNumber', orderNumber, 7);
      setCookie('selectedStyle', selectedStyle, 7);
      setCookie('stopCount', stopCount, 7);
  
      startRegistration();
  };
  
  

  const stopAndResetTimer = () => {
    setIsRegisterActive(false); 
    setElapsedTime(0); 
  };

  const getTurnoRegistro = () => {
    const startTurno = 6 * 60; 
    const endTurno = 14 * 60 + 30; 

    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    if (nowMinutes >= startTurno && nowMinutes <= endTurno) {
      const turnosDesdeInicio = Math.floor((nowMinutes - startTurno) / 30); 
      return turnosDesdeInicio % 10;
    }
    return 0; 
  };

  const generateExcelAndSaveData = async () => {
    const data: (string | number)[][] = [['Numero de huso', 'Estado', 'Estilo', 'Error']];
    const cells = document.querySelectorAll('.cell');
  
    const registroFallas: any[] = [];
  
    cells.forEach(cell => {
      if (cell instanceof HTMLElement) {
        const number = cell.dataset.number || '';
        const status = cell.dataset.status || '';
        const style = selectedStyle;
  
        if (status) {
          data.push([number, status, style, '']);
          registroFallas.push({
            NumHusoRegistro: number,
            IdFalla: status,
            Estilo: style,
            TurnoRegistro: getTurnoRegistro(),
            FechaRegistro: new Date().toISOString().split('T')[0],
            HoraRegistro: new Date().toISOString().split('T')[1].split('.')[0],
          });
        }
      }
    });

    // Configura los datos a confirmar
    setDataToConfirm(registroFallas);
    setShowConfirmModal(true);
  };

  const saveDataToDatabase = async () => {
    const hours = Math.floor(elapsedTime / 3600000).toString().padStart(2, '0');
    const minutes = Math.floor((elapsedTime % 3600000) / 60000).toString().padStart(2, '0');
    const seconds = Math.floor((elapsedTime % 60000) / 1000).toString().padStart(2, '0');
    const totalTime = `${hours}:${minutes}:${seconds}`;

      
    try {
      const response = await axios.post('/api/save-to-db', { 
        data: dataToConfirm.map(record => ({
          ...record,
          TurnoRegistro: getTurnoRegistro(),
          TiempoRegistro: totalTime,
          FechaRegistro: new Date().toISOString().split('T')[0],
          HoraRegistro: new Date().toISOString().split('T')[1].split('.')[0],
        })),
        orderNumber,
        stopCount,
      });
  
      if (response.data.success) {
        setShowSuccessModal(true);
        setIsRegisterActive(false);
        setElapsedTime(0);
        resetGrid();
        setTimeout(() => {
          window.location.reload();
        }, 2000); 
      } else {
        setError('Error al guardar datos: ' + response.data.error);
      }
    } catch (error) {
      console.error('Error al insertar datos en la base de datos:', error);
      setError('Error al insertar datos en la base de datos: ' + (error as Error).message);
    }
  };

  const resetGrid = () => {
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
      const textContent = cell.textContent?.split(' ');
      const number = textContent?.[0];

      if (cell instanceof HTMLElement) {
        cell.textContent = number ?? '';
        cell.style.backgroundColor = '#e9ecef';
      }
    });
  };

  const showAlert = () => setShowAlertModal(true);
  
  const styleOptions = [
    'Trama base 8oz 2750',
    'Trama base 6oz 2100',
    'Trama base 6oz 1800',
    'Trama base 5oz 1500',
    'Trama base 5oz 1340',
    'Trama top 3oz 1100',
    'Trama top 2.6oz 800',
    'Trama cotton blanco 840',
    'Trama cotton amarillo 840',
    'Pie base 6oz 1800',
    'Pie base 8oz 1300',
    'Pie base 6.5oz 1200',
    'Pie base 6oz 1050',
    'Pie base 5oz 675',
    'Pie top 3oz 450',
    'Pie top 350',
    'Pie GCOVER 570',
    'Pie polybac 465',
    'Pie top 1050 blanco',
    'Fuera de programa',
    'Trama GCOVER 1140',
    'Trama base blanco 1300',
    'Pie cotton 380',
    'Trama jumbo blanco 2100',
    'Trama jumbo blanco 1550',
  ];

  const selectStyle = (styleOption: string) => {
    setSelectedStyle(styleOption);
  };

  const cancelSelection = () => {
    //setShowStyleModal(false);
  };

  const [opValue, setOpValue] = useState<string>(orderNumber);
  const [estiloValue, setEstiloValue] = useState<string>(selectedStyle);

  return (
    <div className="container mt-3">
      <div className="header">
        <h2 className="title-text">Selecciona el huso que presenta la falla</h2>
        <Button className="btn btn-primary login-button" onClick={handleLoginClick}>
          Iniciar sesión
        </Button>
      </div>

      <div className="content-container">
        <div className="timer-inputs-container">
          <div className="timer-container">
            <Timer time={elapsedTime} />
          </div>
          <div className="inputs-container">
            <input
              type="text"
              className="form-control input-op"
              placeholder="OP"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
            />
            <input
              type="text"
              className="form-control input-estilo"
              placeholder="Estilo"
              value={selectedStyle}
              onChange={(e) => setSelectedStyle(e.target.value)}
            />
            <input
              type="text"
              className="form-control input-stop"
              placeholder="Numero de Paradas"
              value={stopCount}
              onChange={(e) => setStopCount(e.target.value)}
            />
            <button className='registrar' onClick={() => setShowInputModal(true)}>Nueva orden</button>
      </div>
        </div>

        <Button id="registerButton" className="btn btn-primary" onClick={startRegistration}>
          Iniciar a registrar
        </Button>
      </div>

      <Grid isRegisterActive={isRegisterActive} showAlert={showAlert} />

      <Button id="generateButton" className="btn btn-success mt-3" onClick={generateExcelAndSaveData} disabled={!isRegisterActive}>
        Guardar registro
      </Button>

      <Modal show={showSuccessModal} onHide={() => setShowSuccessModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Éxito</Modal.Title>
        </Modal.Header>
        <Modal.Body>Datos guardados con éxito.</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSuccessModal(false)}>Cerrar</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showAlertModal} onHide={() => setShowAlertModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Atención</Modal.Title>
        </Modal.Header>
        <Modal.Body>Selecciona un huso antes de continuar.</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAlertModal(false)}>Cerrar</Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showInputModal}
        onHide={() => setShowInputModal(false)}
        dialogClassName="modal-custom"
      >
        <Modal.Header closeButton>
          <Modal.Title>Ingrese los datos</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            <label>Número de Orden</label>
            <input
              type="text"
              className="form-control"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
            />
          </div>
          <div className="mt-2">
            <label>Número de Paradas</label>
            <input
              type="text"
              className="form-control"
              value={stopCount}
              onChange={(e) => setStopCount(e.target.value)}
            />
          </div>
          <div className="mt-2">
            <label>Estilo</label>
            <select className="form-control" onChange={(e) => selectStyle(e.target.value)} value={selectedStyle}>
              <option value="">Seleccione el estilo</option>
              {styleOptions.map((styleOption) => (
                <option key={styleOption} value={styleOption}>{styleOption}</option>
              ))}
            </select>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowInputModal(false)}>Cancelar</Button>
          <Button variant="primary" onClick={handleInputModalSubmit}>Aceptar</Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showConfirmModal}
        onHide={() => setShowConfirmModal(false)}
        dialogClassName="modal-custom"
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirmación</Modal.Title>
        </Modal.Header>
        <Modal.Body className='custom-modal-body'>
  <p>¿Estás seguro de que quieres guardar estos datos?</p>
  <div className="table-container">
    <p className="style-info">Estilo: {dataToConfirm.length > 0 ? dataToConfirm[0].Estilo : 'No disponible'}</p>
    <table className="table">
      <thead>
        <tr>
          <th>Numero de huso</th>
          <th>Estado</th>
        </tr>
      </thead>
      <tbody>
        {dataToConfirm.map((item, index) => (
          <tr key={index}>
            <td>{item.NumHusoRegistro}</td>
            <td>{item.IdFalla}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>Cancelar</Button>
          <Button
            variant="primary"
            onClick={() => {
              saveDataToDatabase();
              setShowConfirmModal(false);
            }}
          >
            Confirmar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}