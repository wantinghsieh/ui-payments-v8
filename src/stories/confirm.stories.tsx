import ConfirmTemplate from "../templates/ConfirmTemplate/ConfirmTemplate"
import { confirmTypes } from "./data/confirm";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/globals.scss";
import "@cox/core-ui8/dist/index.css";
export default {
    title: "Payments/Confirm",
    component: ConfirmTemplate,
}
export const success = () => <ConfirmTemplate {...confirmTypes.success} />