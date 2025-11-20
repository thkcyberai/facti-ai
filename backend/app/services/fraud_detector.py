"""
Fraud Detection Service
Analyzes verification attempts for suspicious patterns
"""

from datetime import datetime, timedelta
from typing import Dict, List, Optional
import hashlib

class FraudDetector:
    """Fraud scoring and pattern detection"""
    
    def __init__(self):
        # Thresholds
        self.max_attempts_per_hour = 5
        self.max_attempts_per_day = 20
        self.suspicious_hours = [0, 1, 2, 3, 4, 5]  # Midnight to 5am
        
        # In-memory store (in production, use Redis/database)
        self.attempt_history = {}
        self.blacklist = set()
        
    def calculate_risk_score(
        self,
        user_id: str,
        device_info: Dict,
        verification_data: Dict,
        attempt_history: Optional[List] = None
    ) -> Dict:
        """
        Calculate fraud risk score
        
        Args:
            user_id: User identifier
            device_info: Device fingerprint data
            verification_data: Face match, liveness results
            attempt_history: Previous attempts by this user
            
        Returns:
            {
                'risk_score': 0-100,
                'risk_level': 'LOW'|'MEDIUM'|'HIGH'|'CRITICAL',
                'flags': ['flag1', 'flag2'],
                'recommendation': 'APPROVE'|'REVIEW'|'REJECT'
            }
        """
        
        flags = []
        score = 0
        
        # Check 1: Attempt frequency
        frequency_score, frequency_flags = self._check_attempt_frequency(user_id)
        score += frequency_score
        flags.extend(frequency_flags)
        
        # Check 2: Time of day
        time_score, time_flags = self._check_time_anomaly()
        score += time_score
        flags.extend(time_flags)
        
        # Check 3: Device signals
        device_score, device_flags = self._check_device_signals(device_info)
        score += device_score
        flags.extend(device_flags)
        
        # Check 4: Verification quality
        quality_score, quality_flags = self._check_verification_quality(verification_data)
        score += quality_score
        flags.extend(quality_flags)
        
        # Check 5: Blacklist
        blacklist_score, blacklist_flags = self._check_blacklist(user_id, device_info)
        score += blacklist_score
        flags.extend(blacklist_flags)
        
        # Determine risk level
        if score >= 80:
            risk_level = 'CRITICAL'
            recommendation = 'REJECT'
        elif score >= 60:
            risk_level = 'HIGH'
            recommendation = 'REVIEW'
        elif score >= 40:
            risk_level = 'MEDIUM'
            recommendation = 'REVIEW'
        else:
            risk_level = 'LOW'
            recommendation = 'APPROVE'
        
        return {
            'risk_score': min(score, 100),
            'risk_level': risk_level,
            'flags': flags,
            'recommendation': recommendation,
            'details': {
                'frequency_score': frequency_score,
                'time_score': time_score,
                'device_score': device_score,
                'quality_score': quality_score,
                'blacklist_score': blacklist_score
            }
        }
    
    def _check_attempt_frequency(self, user_id: str) -> tuple[int, List[str]]:
        """Check if user is attempting verification too frequently"""
        score = 0
        flags = []
        
        # Get user's attempt history
        if user_id not in self.attempt_history:
            self.attempt_history[user_id] = []
        
        now = datetime.utcnow()
        attempts = self.attempt_history[user_id]
        
        # Count attempts in last hour
        recent_attempts = [a for a in attempts if now - a < timedelta(hours=1)]
        if len(recent_attempts) >= self.max_attempts_per_hour:
            score += 30
            flags.append('EXCESSIVE_ATTEMPTS_HOURLY')
        
        # Count attempts in last day
        daily_attempts = [a for a in attempts if now - a < timedelta(days=1)]
        if len(daily_attempts) >= self.max_attempts_per_day:
            score += 40
            flags.append('EXCESSIVE_ATTEMPTS_DAILY')
        
        # Add current attempt
        self.attempt_history[user_id].append(now)
        
        # Clean old attempts (older than 24 hours)
        self.attempt_history[user_id] = [
            a for a in self.attempt_history[user_id]
            if now - a < timedelta(days=1)
        ]
        
        return score, flags
    
    def _check_time_anomaly(self) -> tuple[int, List[str]]:
        """Check if attempt is at suspicious time"""
        score = 0
        flags = []
        
        now = datetime.utcnow()
        current_hour = now.hour
        
        # Suspicious if during late night/early morning
        if current_hour in self.suspicious_hours:
            score += 10
            flags.append('SUSPICIOUS_TIME_OF_DAY')
        
        return score, flags
    
    def _check_device_signals(self, device_info: Dict) -> tuple[int, List[str]]:
        """Analyze device fingerprint for fraud indicators"""
        score = 0
        flags = []
        
        # Check for VPN/Proxy
        if device_info.get('using_vpn'):
            score += 15
            flags.append('VPN_DETECTED')
        
        # Check for emulator
        if device_info.get('is_emulator'):
            score += 25
            flags.append('EMULATOR_DETECTED')
        
        # Check for rooted/jailbroken device
        if device_info.get('is_rooted'):
            score += 20
            flags.append('ROOTED_DEVICE')
        
        # Check device consistency
        if device_info.get('device_mismatch'):
            score += 15
            flags.append('DEVICE_MISMATCH')
        
        return score, flags
    
    def _check_verification_quality(self, verification_data: Dict) -> tuple[int, List[str]]:
        """Analyze verification results for suspicious patterns"""
        score = 0
        flags = []
        
        # Check face match confidence
        face_match = verification_data.get('face_match', {})
        if not face_match.get('match'):
            score += 30
            flags.append('FACE_MATCH_FAILED')
        elif face_match.get('confidence', 1.0) < 0.5:
            score += 20
            flags.append('LOW_FACE_CONFIDENCE')
        
        # Check liveness detection
        liveness = verification_data.get('liveness', {})
        if not liveness.get('is_live'):
            score += 40
            flags.append('LIVENESS_FAILED')
        elif liveness.get('confidence', 1.0) < 0.3:
            score += 25
            flags.append('LOW_LIVENESS_CONFIDENCE')
        
        # Check for quality mismatches
        if face_match.get('distance', 0) > 0.5:
            score += 15
            flags.append('HIGH_FACE_DISTANCE')
        
        return score, flags
    
    def _check_blacklist(self, user_id: str, device_info: Dict) -> tuple[int, List[str]]:
        """Check against known fraudsters"""
        score = 0
        flags = []
        
        # Check user blacklist
        if user_id in self.blacklist:
            score += 100
            flags.append('USER_BLACKLISTED')
        
        # Check device fingerprint
        device_hash = self._hash_device(device_info)
        if device_hash in self.blacklist:
            score += 100
            flags.append('DEVICE_BLACKLISTED')
        
        return score, flags
    
    def _hash_device(self, device_info: Dict) -> str:
        """Create device fingerprint hash"""
        fingerprint = f"{device_info.get('device_id', '')}-{device_info.get('ip_address', '')}"
        return hashlib.sha256(fingerprint.encode()).hexdigest()
    
    def add_to_blacklist(self, user_id: str = None, device_info: Dict = None):
        """Add user or device to blacklist"""
        if user_id:
            self.blacklist.add(user_id)
        if device_info:
            device_hash = self._hash_device(device_info)
            self.blacklist.add(device_hash)
    
    def get_user_history(self, user_id: str) -> Dict:
        """Get verification attempt history for user"""
        attempts = self.attempt_history.get(user_id, [])
        
        now = datetime.utcnow()
        last_hour = [a for a in attempts if now - a < timedelta(hours=1)]
        last_day = [a for a in attempts if now - a < timedelta(days=1)]
        
        return {
            'total_attempts': len(attempts),
            'attempts_last_hour': len(last_hour),
            'attempts_last_day': len(last_day),
            'last_attempt': attempts[-1].isoformat() if attempts else None,
            'is_blacklisted': user_id in self.blacklist
        }
