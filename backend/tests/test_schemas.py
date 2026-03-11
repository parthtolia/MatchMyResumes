"""Tests for Pydantic schema validation (input sanitization & max_length)."""
import pytest
from pydantic import ValidationError

from app.schemas.common import (
    JDCreateRequest,
    CoverLetterRequest,
    ApplicationCreate,
    ApplicationUpdate,
    CheckoutSessionRequest,
)
from app.schemas.resume import (
    ATSScoreRequest,
    OptimizeResumeRequest,
)


# ── JDCreateRequest ──────────────────────────────────────────────────────────

class TestJDCreateRequest:
    def test_valid_request(self):
        jd = JDCreateRequest(raw_text="x" * 150, title="SWE at Google", company="Google")
        assert jd.title == "SWE at Google"
        assert len(jd.raw_text) == 150

    def test_min_length_enforced(self):
        with pytest.raises(ValidationError) as exc_info:
            JDCreateRequest(raw_text="too short")
        assert "min_length" in str(exc_info.value).lower() or "at least" in str(exc_info.value).lower()

    def test_max_length_raw_text(self):
        with pytest.raises(ValidationError):
            JDCreateRequest(raw_text="x" * 50001)

    def test_max_length_title(self):
        with pytest.raises(ValidationError):
            JDCreateRequest(raw_text="x" * 150, title="x" * 256)

    def test_max_length_company(self):
        with pytest.raises(ValidationError):
            JDCreateRequest(raw_text="x" * 150, company="x" * 256)

    def test_optional_fields_default_none(self):
        jd = JDCreateRequest(raw_text="x" * 150)
        assert jd.title is None
        assert jd.company is None

    def test_empty_string_rejected(self):
        with pytest.raises(ValidationError):
            JDCreateRequest(raw_text="")

    def test_boundary_100_chars_accepted(self):
        jd = JDCreateRequest(raw_text="x" * 100)
        assert len(jd.raw_text) == 100

    def test_boundary_99_chars_rejected(self):
        with pytest.raises(ValidationError):
            JDCreateRequest(raw_text="x" * 99)

    def test_boundary_50000_chars_accepted(self):
        jd = JDCreateRequest(raw_text="x" * 50000)
        assert len(jd.raw_text) == 50000


# ── ApplicationCreate ────────────────────────────────────────────────────────

class TestApplicationCreate:
    def test_valid_application(self):
        app = ApplicationCreate(company_name="Acme", job_title="Engineer")
        assert app.company_name == "Acme"

    def test_company_name_required(self):
        with pytest.raises(ValidationError):
            ApplicationCreate(company_name="", job_title="Engineer")

    def test_job_title_required(self):
        with pytest.raises(ValidationError):
            ApplicationCreate(company_name="Acme", job_title="")

    def test_company_name_max_length(self):
        with pytest.raises(ValidationError):
            ApplicationCreate(company_name="x" * 256, job_title="Test")

    def test_job_title_max_length(self):
        with pytest.raises(ValidationError):
            ApplicationCreate(company_name="Test", job_title="x" * 256)

    def test_job_url_max_length(self):
        with pytest.raises(ValidationError):
            ApplicationCreate(company_name="Test", job_title="Test", job_url="x" * 2049)

    def test_notes_max_length(self):
        with pytest.raises(ValidationError):
            ApplicationCreate(company_name="Test", job_title="Test", notes="x" * 5001)

    def test_notes_at_limit_accepted(self):
        app = ApplicationCreate(company_name="Test", job_title="Test", notes="x" * 5000)
        assert len(app.notes) == 5000


# ── ApplicationUpdate ────────────────────────────────────────────────────────

class TestApplicationUpdate:
    def test_empty_update(self):
        update = ApplicationUpdate()
        assert update.company_name is None

    def test_partial_update(self):
        update = ApplicationUpdate(company_name="NewCo")
        assert update.company_name == "NewCo"
        assert update.job_title is None

    def test_company_name_max_length(self):
        with pytest.raises(ValidationError):
            ApplicationUpdate(company_name="x" * 256)

    def test_notes_max_length(self):
        with pytest.raises(ValidationError):
            ApplicationUpdate(notes="x" * 5001)


# ── CoverLetterRequest ───────────────────────────────────────────────────────

class TestCoverLetterRequest:
    def test_valid_request(self):
        cl = CoverLetterRequest(resume_id="abc", jd_id="def")
        assert cl.resume_id == "abc"

    def test_company_name_max_length(self):
        with pytest.raises(ValidationError):
            CoverLetterRequest(resume_id="abc", jd_id="def", company_name="x" * 256)

    def test_applicant_name_max_length(self):
        with pytest.raises(ValidationError):
            CoverLetterRequest(resume_id="abc", jd_id="def", applicant_name="x" * 256)


# ── OptimizeResumeRequest ────────────────────────────────────────────────────

class TestOptimizeResumeRequest:
    def test_valid_request(self):
        req = OptimizeResumeRequest(resume_id="abc", jd_id="def")
        assert req.save_as_version is True

    def test_jd_text_max_length(self):
        with pytest.raises(ValidationError):
            OptimizeResumeRequest(resume_id="abc", jd_text="x" * 50001)

    def test_jd_text_at_limit_accepted(self):
        req = OptimizeResumeRequest(resume_id="abc", jd_text="x" * 50000)
        assert len(req.jd_text) == 50000

    def test_version_tag_max_length(self):
        with pytest.raises(ValidationError):
            OptimizeResumeRequest(resume_id="abc", jd_id="def", version_tag="x" * 256)


# ── CheckoutSessionRequest ───────────────────────────────────────────────────

class TestCheckoutSessionRequest:
    def test_valid_pro(self):
        req = CheckoutSessionRequest(plan="pro", success_url="http://ok", cancel_url="http://cancel")
        assert req.plan == "pro"

    def test_valid_premium(self):
        req = CheckoutSessionRequest(plan="premium", success_url="http://ok", cancel_url="http://cancel")
        assert req.plan == "premium"

    def test_invalid_plan_rejected(self):
        with pytest.raises(ValidationError):
            CheckoutSessionRequest(plan="enterprise", success_url="http://ok", cancel_url="http://cancel")

    def test_free_plan_rejected(self):
        with pytest.raises(ValidationError):
            CheckoutSessionRequest(plan="free", success_url="http://ok", cancel_url="http://cancel")
