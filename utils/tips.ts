import { type Protocol } from '../types';
import { dayDiff } from './dateUtils';

const DOSE_DAY_TIP = "Hoy es día de dosis. Recuerda tomarla por la mañana en un entorno tranquilo. Observa las sensaciones sutiles y anota tus percepciones en el diario.";
const TRANSITION_DAY_TIP = "Hoy es día de transición. Aunque no tomes dosis, los efectos pueden continuar. Es un buen día para la introspección y reflexionar sobre las experiencias de ayer.";
const REST_DAY_TIP = "Hoy es un día de descanso para integrar. Aprovecha para conectar con tus intenciones y objetivos. La claridad a menudo llega en los momentos de calma.";
const INACTIVE_TIP = "Define una intención clara para tu proceso. ¿Qué aspecto de tu vida te gustaría mejorar o explorar? Escribir tus objetivos puede potenciar la experiencia.";

export const getTipForToday = (dateStr: string, startDateStr: string, protocol: Protocol): string => {
    const currentDate = new Date(dateStr + 'T00:00:00');
    const startDate = new Date(startDateStr + 'T00:00:00');

    if (currentDate < startDate) {
        return INACTIVE_TIP;
    }

    const diff = dayDiff(startDate, currentDate);
    const cycleLength = protocol.onDays + protocol.offDays;

    if (cycleLength <= 0) {
        return INACTIVE_TIP;
    }

    const dayInCycle = diff % cycleLength;

    if (dayInCycle < protocol.onDays) {
        return DOSE_DAY_TIP;
    } else {
        // Manejo especial para el día de transición del Protocolo Fadiman
        if (protocol.id === 'fadiman' && dayInCycle === protocol.onDays) {
            return TRANSITION_DAY_TIP;
        }
        return REST_DAY_TIP;
    }
};
