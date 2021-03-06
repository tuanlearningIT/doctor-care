import React, { Component } from "react";
import { connect } from "react-redux";
import "./BookingModal.scss";
import { Modal } from "reactstrap";
import ProFileDoctor from "../ProFileDoctor";
import _ from "lodash";
import DatePicker from "../../../../components/Input/DatePicker";
import * as actions from "../../../../store/actions";
import { LANGUAGES } from "../../../../utils";
import Select from "react-select";
import { postPatientProfileDoctorbyId } from "../../../../services/userService";
import { toast } from "react-toastify";
import { FormattedMessage } from "react-intl";
import moment from "moment";
import LoadingOverlay from "react-loading-overlay";
class BookingModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fullName: "",
      PhoneNumer: "",
      email: "",
      address: "",
      reason: "",
      birthday: "",
      selectedGender: "",
      doctorId: "",
      genders: "",
      timeType: "",
      isShowLoading: false,
    };
  }
  componentDidMount() {
    this.props.getGenders();
  }
  buildDateGender = (data) => {
    let result = [];
    let language = this.props.language;
    if (data && data.length > 0) {
      data.map((item) => {
        let object = {};
        object.label = language === LANGUAGES.VI ? item.valueVI : item.valueEN;
        object.value = item.keyMap;
        result.push(object);
      });
    }
    return result;
  };
  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props.language !== prevProps.language) {
      this.setState({
        genders: this.buildDateGender(this.props.genders),
      });
    }
    if (this.props.genders !== prevProps.genders) {
      this.setState({
        genders: this.buildDateGender(this.props.genders),
      });
    }

    if (this.props.dataTime !== prevProps.dataTime) {
      if (this.props.dataTime && !_.isEmpty(this.props.dataTime)) {
        let doctorId = this.props.dataTime.doctorId;
        let timeType = this.props.dataTime.timeType;
        this.setState({
          doctorId: doctorId,
          timeType: timeType,
        });
      }
    }
  }
  buildTimeBooking = (dataTime) => {
    let { language } = this.props;
    if (dataTime && !_.isEmpty(dataTime)) {
      let time =
        language === LANGUAGES.VI
          ? dataTime.timeTypeData.valueVI
          : dataTime.timeTypeData.valueEN;
      let date =
        language === LANGUAGES.VI
          ? moment.unix(+dataTime.date / 1000).format("dddd - DD/MM/YYYY")
          : moment
              .unix(+dataTime.date / 1000)
              .locale("en")
              .format("ddd - MM//DD/YYY");

      return `${time} - ${date}`;
    }
    return "";
  };
  buildDoctorName = (dataTime) => {
    let { language } = this.props;
    if (dataTime && !_.isEmpty(dataTime)) {
      let name =
        language === LANGUAGES.VI
          ? `${dataTime.doctorData.firstName} ${dataTime.doctorData.lastName} `
          : `${dataTime.doctorData.lastName} ${dataTime.doctorData.firstName} `;

      return name;
    }
    return "";
  };
  handleChangeinput = (event, id) => {
    let copySate = { ...this.state };
    copySate[id] = event.target.value;
    this.setState({
      ...copySate,
    });
  };
  handleChangeDatePicker = (date) => {
    this.setState({
      birthday: date[0],
    });
  };
  handleChangeSelect = (seclectedOption) => {
    this.setState({ selectedGender: seclectedOption });
  };

  handleComfirmBooking = async () => {
    this.setState({
      isShowLoading: true,
    });
    ///validate input
    let date = new Date(this.state.birthday).getTime();
    let timeString = this.buildTimeBooking(this.props.dataTime);
    let doctorName = this.buildDoctorName(this.props.dataTime);
    let res = await postPatientProfileDoctorbyId({
      fullName: this.state.fullName,
      email: this.state.email,
      address: this.state.address,
      reason: this.state.reason,
      date: this.props.dataTime.date,
      birthday: date,
      selectedGender: this.state.selectedGender.value,
      doctorId: this.state.doctorId,
      timeType: this.state.timeType,
      language: this.props.language,
      timeString: timeString,
      doctorName: doctorName,
    });
    this.setState({
      isShowLoading: false,
    });
    if (res && res.errCode === 0) {
      this.props.closeBooking();
      toast.success("Booking apppointment success");
    } else {
      toast.error("Booking apppointment error");
    }
  };
  render() {
    let { isOpenModalBooking, dataTime, closeBooking } = this.props;
    let doctorId = "";
    if (dataTime && !_.isEmpty(dataTime)) {
      doctorId = dataTime.doctorId;
    }
    return (
      <>
        <LoadingOverlay
          active={this.state.isShowLoading}
          spinner
          text="Loading..."
        >
          <Modal
            isOpen={isOpenModalBooking}
            className={"booking-modal-container"}
            size="lg"
            centered
            //  backdrop={true}
          >
            <div className="booking-modal-content">
              <div className="booking-modal-header">
                <span className="left">
                  <FormattedMessage id="patient.booking-modal.intro" />
                </span>
                <span className="right" onClick={closeBooking}>
                  <i className="fas fa-times"></i>
                </span>
              </div>
              <div className="booking-modal-body">
                {/* {JSON.stringify(dataTime)} */}
                <div className="doctor-info">
                  <ProFileDoctor
                    doctorId={doctorId}
                    dataTime={dataTime}
                    isShowDescriptionDoctor={false}
                    isShowLinkDetail={false}
                    isShowPrice={true}
                  />
                </div>
                <div className="row">
                  <div className="col-6 form-group">
                    <label>
                      <FormattedMessage id="patient.booking-modal.fullname" />
                    </label>
                    <input
                      className="form-control"
                      onChange={(event) =>
                        this.handleChangeinput(event, "fullName")
                      }
                    />
                  </div>
                  <div className="col-6 form-group">
                    <label>
                      <FormattedMessage id="patient.booking-modal.phonenumber" />
                    </label>
                    <input
                      className="form-control"
                      onChange={(event) =>
                        this.handleChangeinput(event, "PhoneNumer")
                      }
                    />
                  </div>
                  <div className="col-6 form-group">
                    <label>
                      <FormattedMessage id="patient.booking-modal.email" />
                    </label>
                    <input
                      className="form-control"
                      onChange={(event) =>
                        this.handleChangeinput(event, "email")
                      }
                    />
                  </div>
                  <div className="col-6 form-group">
                    <label>
                      <FormattedMessage id="patient.booking-modal.address" />
                    </label>
                    <input
                      className="form-control"
                      onChange={(event) =>
                        this.handleChangeinput(event, "address")
                      }
                    />
                  </div>
                  <div className="col-12 form-group">
                    <label>
                      <FormattedMessage id="patient.booking-modal.reason" />
                    </label>
                    <input
                      className="form-control"
                      onChange={(event) =>
                        this.handleChangeinput(event, "reason")
                      }
                    />
                  </div>
                  <div className="col-6 form-group">
                    <label>
                      <FormattedMessage id="patient.booking-modal.birthday" />
                    </label>
                    <DatePicker
                      value={this.state.birthday}
                      className="form-control"
                      onChange={this.handleChangeDatePicker}
                    />
                  </div>
                  <div className="col-6 mb-3 form-group">
                    <label>
                      <FormattedMessage id="patient.booking-modal.gender" />
                    </label>
                    <Select
                      value={this.state.selectedGender}
                      options={this.state.genders}
                      onChange={this.handleChangeSelect}
                    />
                  </div>
                </div>
                <div className="booking-modal-footer">
                  <button
                    className="btn-booking-confirm"
                    onClick={() => this.handleComfirmBooking()}
                  >
                    <FormattedMessage id="patient.booking-modal.btncomfirm" />
                  </button>
                  <button className="btn-booking-cancel" onClick={closeBooking}>
                    <FormattedMessage id="patient.booking-modal.btncancel" />
                  </button>
                </div>
              </div>
            </div>
          </Modal>
        </LoadingOverlay>
      </>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    language: state.app.language,
    genders: state.admin.genders,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    getGenders: () => dispatch(actions.fetchGenderStart()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(BookingModal);
