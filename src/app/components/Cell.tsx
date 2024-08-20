import { useState } from 'react';
import { Modal } from 'react-bootstrap';

interface CellProps {
  number: number;
  isRegisterActive: boolean;
  showAlert: () => void;
}

const statusLabels: Record<string, string[]> = {
  '1A': ['Cinta caída', 'Velocidad baja. Problema relacionado con el potenciometro'],
  '1B': ['Cinta caída', 'Dancer no está estable'],
  '1C': ['Cinta caída', 'Guía floja o safada', 'Guía quebrada'],
  '1D': ['Cinta caída', 'Hilos mal direccionados en rodaja', 'Rodajas desalineada', 'Rodaja de diferente tamaño'],
  '1E': ['Cinta caída', 'Mal posición del torque', 'Hilo con la tensión incorrecta'],
  '2A': ['Bobina Boluda', 'Carcasa bailando', 'Huso vibrando'],
  '2B': ['Bobina Boluda', 'Mal embobinado', 'Dejar guía equivocada'],
  '3A': ['1 Punta', 'Guía quebrada', 'Guía de cerámica fija incompleta'],
  '3B': ['1 Punta', 'Colas de cochino'],
  '3C': ['1 Punta', 'Árbol sucio', 'Material externo al molino provocando reventamiento de hilos'],
  '4A': ['Hilo fibrilado', 'Rodajas amarradas. Rodajas desgastadas.'],
  '4B': ['Hilo fibrilado', 'Rodillo cromado amarrado.'],
  '5A': ['Rizos', 'Diferencia de temperaturas en rodillos calientes'],
  '6A': ['No enciende', 'Se para', 'Huso no enciende, se para o le falta fuerza'],
  '7A': ['Otras causas', 'Otras causas'],
};

const colorMap: Record<string, string[]> = {
  'Cinta caída': ['#FF9A9A', '#FF7F7F', '#FF4D4D', '#FF1A1A', '#E60000'],
  'Bobina Boluda': ['#B3E0FF', '#99C2FF', '#66B3FF', '#3399FF', '#007FFF'],
  '1 Punta': ['#B3F2B3', '#80F080', '#4DFF4D', '#1AFF1A', '#00CC00'],
  'Hilo fibrilado': ['#FFFF00', '#FFEA00', '#FFD700', '#FFC107', '#FFB300'],
  'Rizos': ['#D8BFD8', '#D9A9D9', '#DA87DA', '#D965D9', '#D945D9'],
  'No enciende': ['#FFB84D', '#FF9A3D', '#FF7F2A', '#FF6600', '#FF4500'],
  'Otras causas': ['#FFB6C1', '#FF9B9D', '#FF7F9E', '#FF6F8E', '#FF5C7F']
};

export default function Cell({ number, isRegisterActive, showAlert }: CellProps) {
  const [status, setStatus] = useState<string>('');
  const [style, setStyle] = useState<string>('');
  const [showStatusModal, setShowStatusModal] = useState<boolean>(false);

  const updateCell = (statusCode: string) => {
    setStatus(statusCode);
    setShowStatusModal(false);
  };

  const cancelSelection = () => {
    setStatus('');
    setStyle('');
    setShowStatusModal(false);
  };

  // Función para obtener el color de acuerdo al defecto y su índice
  const getColor = (defect: string, index: number) => {
    const colors = colorMap[defect] || ['#FFFFFF'];
    return colors[index % colors.length];
  };

  // Obtener el color de fondo actual según el estado seleccionado
  const currentBackgroundColor = status ? getColor(statusLabels[status][0], Object.keys(statusLabels).indexOf(status)) : '#FFFFFF';

  
        


  return (
    <>
      <div
        className="cell"
        data-number={number}
        data-status={status}
        data-style={style}
        onClick={() => {
          if (isRegisterActive) {
            setShowStatusModal(true);
          } else {
            showAlert();
          }
        }}
        style={{ backgroundColor: currentBackgroundColor,  padding: '10px', borderRadius: '5px' }}
      >
        {number} <br />
        {status && <span>{status}</span>}
      </div>

      <Modal
        show={showStatusModal}
        onHide={() => setShowStatusModal(false)}
        dialogClassName="modal-custom"
      >
        <Modal.Header closeButton style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Modal.Title>Actualizar Estado</Modal.Title>
          <button
            className="btn btn-danger"
            style={{ marginLeft: '16px' }}
            onClick={cancelSelection}
          >
            Cancelar selección
          </button>
        </Modal.Header>

        <Modal.Body className="custom-modal-body">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Código</th>
                <th>Defecto</th>
                <th>Descripción</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(statusLabels).map((key, idx) => {
                const defect = statusLabels[key][0];
                const description = statusLabels[key].slice(1).join(' - ');

                return (
                  <tr key={key}>
                    <td>{key}</td>
                    <td>{defect}</td>
                    <td>{description}</td>
                    <td>
                      <button
                        className="btn"
                        style={{ backgroundColor: getColor(defect, idx), color: '#FFFFFF' }}
                        onClick={() => updateCell(key)}
                      >
                        Seleccionar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Modal.Body>
      </Modal>
    </>
  );
}


  