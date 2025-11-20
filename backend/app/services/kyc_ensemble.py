"""
KYC Ensemble Service
Combines all verification components into unified KYC decision
"""

from typing import Dict
from app.services.document_verifier import DocumentVerifier
from app.services.face_matcher import FaceMatcher
from app.services.liveness_detector import LivenessDetector
from app.services.fraud_detector import FraudDetector

class KYCEnsemble:
    """Master KYC verification orchestrator"""
    
    def __init__(self):
        self.document_verifier = DocumentVerifier()
        self.face_matcher = FaceMatcher()
        self.liveness_detector = LivenessDetector()
        self.fraud_detector = FraudDetector()
        
        # Decision weights
        self.weights = {
            'document': 0.15,
            'face_match': 0.35,
            'liveness': 0.30,
            'fraud': 0.20
        }
        
        # Thresholds - ensure they're floats
        self.pass_threshold = float(75)
        self.fail_threshold = float(40)
    
    def verify_kyc(
        self,
        user_id: str,
        id_photo_path: str,
        selfie_path: str,
        device_info: Dict
    ) -> Dict:
        """Complete KYC verification pipeline"""
        
        try:
            results = {}
            flags = []
            
            # Component 1: Document Verification
            doc_result = self.document_verifier.verify(id_photo_path)
            results['document'] = doc_result
            if not doc_result['valid']:
                flags.extend(doc_result.get('issues', []))
            
            # Component 2: Face Matching
            face_result = self.face_matcher.verify(id_photo_path, selfie_path)
            results['face_match'] = face_result
            if 'error' in face_result or not face_result.get('match'):
                flags.append('FACE_MATCH_FAILED')
            
            # Component 3: Liveness Detection
            liveness_result = self.liveness_detector.detect(selfie_path)
            results['liveness'] = liveness_result
            if 'error' in liveness_result or not liveness_result.get('is_live'):
                flags.append('LIVENESS_FAILED')
            
            # Component 4: Fraud Scoring
            fraud_result = self.fraud_detector.calculate_risk_score(
                user_id=user_id,
                device_info=device_info,
                verification_data={
                    'face_match': face_result,
                    'liveness': liveness_result
                }
            )
            results['fraud'] = fraud_result
            flags.extend(fraud_result.get('flags', []))
            
            # Calculate overall score
            overall_score = self._calculate_overall_score(results)
            print(f"DEBUG: overall_score = {overall_score}, type = {type(overall_score)}")
            
            # Make decision
            verdict, recommendation = self._make_decision(
                overall_score, 
                results, 
                flags
            )
            
            # Calculate confidence
            confidence = self._calculate_confidence(results)
            
            return {
                'verdict': verdict,
                'confidence': round(float(confidence), 4),
                'overall_score': round(float(overall_score), 2),
                'recommendation': recommendation,
                'flags': list(set(flags)),
                'components': {
                    'document_verification': {
                        'valid': doc_result.get('valid', False),
                        'verdict': doc_result.get('verdict', 'UNKNOWN'),
                        'quality_score': doc_result.get('quality_score', 0)
                    },
                    'face_matching': {
                        'match': face_result.get('match', False),
                        'similarity': face_result.get('similarity', 0),
                        'confidence': face_result.get('confidence', 'UNKNOWN')
                    },
                    'liveness_detection': {
                        'is_live': liveness_result.get('is_live', False),
                        'confidence': liveness_result.get('confidence', 0),
                        'verdict': liveness_result.get('verdict', 'UNKNOWN')
                    },
                    'fraud_scoring': {
                        'risk_level': fraud_result.get('risk_level', 'UNKNOWN'),
                        'risk_score': fraud_result.get('risk_score', 0),
                        'recommendation': fraud_result.get('recommendation', 'UNKNOWN')
                    }
                },
                'detailed_results': results
            }
            
        except Exception as e:
            print(f"ERROR in verify_kyc: {str(e)}")
            import traceback
            traceback.print_exc()
            raise
    
    def _calculate_overall_score(self, results: Dict) -> float:
        """Calculate weighted overall score (0-100)"""
        try:
            scores = {}
            
            # Document score
            doc_result = results.get('document', {})
            doc_score = doc_result.get('quality_score', 0)
            scores['document'] = float(doc_score) if doc_score is not None else 0.0
            
            # Face match score
            face_result = results.get('face_match', {})
            if face_result.get('match'):
                similarity = face_result.get('similarity', 0)
                face_score = float(similarity) * 100.0 if similarity is not None else 0.0
            else:
                face_score = 0.0
            scores['face_match'] = face_score
            
            # Liveness score
            liveness_result = results.get('liveness', {})
            if liveness_result.get('is_live'):
                liveness_score_raw = liveness_result.get('score', 0.5)
                liveness_score = float(liveness_score_raw) * 100.0 if liveness_score_raw is not None else 50.0
            else:
                liveness_score = 0.0
            scores['liveness'] = liveness_score
            
            # Fraud score
            fraud_result = results.get('fraud', {})
            fraud_risk = fraud_result.get('risk_score', 50)
            fraud_score = 100.0 - float(fraud_risk) if fraud_risk is not None else 50.0
            scores['fraud'] = fraud_score
            
            # Calculate weighted average
            overall = 0.0
            for key in scores:
                overall += float(scores[key]) * float(self.weights[key])
            
            return float(overall)
            
        except Exception as e:
            print(f"ERROR in _calculate_overall_score: {str(e)}")
            import traceback
            traceback.print_exc()
            raise
    
    def _make_decision(
        self, 
        overall_score: float, 
        results: Dict, 
        flags: list
    ) -> tuple[str, str]:
        """Make final KYC decision"""
        
        try:
            # Ensure overall_score is float
            overall_score = float(overall_score)
            
            print(f"DEBUG _make_decision: score={overall_score}, pass_thresh={self.pass_threshold}, fail_thresh={self.fail_threshold}")
            
            # Critical failures
            critical_flags = [
                'FACE_MATCH_FAILED',
                'LIVENESS_FAILED',
                'USER_BLACKLISTED',
                'DEVICE_BLACKLISTED'
            ]
            
            if any(flag in flags for flag in critical_flags):
                return 'FAIL', 'Reject - Critical verification failure'
            
            # Check fraud risk
            fraud_result = results.get('fraud', {})
            if fraud_result.get('risk_level') == 'CRITICAL':
                return 'FAIL', 'Reject - Critical fraud risk detected'
            
            # Score-based decision
            if overall_score >= float(self.pass_threshold):
                if fraud_result.get('risk_level') in ['HIGH', 'MEDIUM']:
                    return 'REVIEW', 'Manual review - High fraud risk despite good verification'
                return 'PASS', 'Approve - All checks passed'
            
            elif overall_score < float(self.fail_threshold):
                return 'FAIL', 'Reject - Verification score too low'
            
            else:
                return 'REVIEW', 'Manual review - Borderline verification score'
                
        except Exception as e:
            print(f"ERROR in _make_decision: {str(e)}")
            import traceback
            traceback.print_exc()
            raise
    
    def _calculate_confidence(self, results: Dict) -> float:
        """Calculate confidence in the decision (0-1)"""
        confidences = []
        
        # Face match confidence
        face_result = results.get('face_match', {})
        if 'similarity' in face_result and face_result['similarity'] is not None:
            confidences.append(abs(float(face_result['similarity']) - 0.5) * 2.0)
        
        # Liveness confidence
        liveness_result = results.get('liveness', {})
        if 'confidence' in liveness_result and liveness_result['confidence'] is not None:
            confidences.append(float(liveness_result['confidence']))
        
        # Document confidence
        doc_result = results.get('document', {})
        if 'confidence' in doc_result and doc_result['confidence'] is not None:
            confidences.append(float(doc_result['confidence']))
        
        # Fraud confidence
        fraud_result = results.get('fraud', {})
        if 'risk_score' in fraud_result and fraud_result['risk_score'] is not None:
            risk = float(fraud_result['risk_score'])
            fraud_confidence = abs(risk - 50.0) / 50.0
            confidences.append(fraud_confidence)
        
        # Average confidence
        if confidences:
            return sum(confidences) / len(confidences)
        return 0.5
